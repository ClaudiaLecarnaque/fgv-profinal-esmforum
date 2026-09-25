# Design Simples no ESM Forum

## Uma observação antes de começar

O enunciado pede para analisar `routes/perguntas.js` e `routes/respostas.js`, mas esses arquivos não existem no repositório atual. O backend inteiro está em três arquivos:

| Arquivo | Papel | Linhas |
|---|---|---|
| `server.js` | Rotas HTTP (Express): as quatro rotas de perguntas e respostas | ~60 |
| `modelo.js` | Regras e consultas de perguntas e respostas | ~55 |
| `bd/bd_utils.js` | Acesso ao SQLite (três funções) | ~25 |

Por isso analiso as rotas de perguntas e respostas onde elas realmente estão, em `server.js`, junto com as funções que elas chamam em `modelo.js`. O fato de todo o backend caber em menos de 150 linhas já é, por si só, o primeiro sinal de design simples.

## O que é Design Simples (e YAGNI)

Kent Beck resume o design simples do XP em quatro regras, em ordem de prioridade: o código (1) passa em todos os testes, (2) revela a intenção, (3) não tem duplicação e (4) tem o menor número possível de elementos. O **YAGNI** ("You Aren't Gonna Need It") é a atitude que sustenta a quarta regra: não construir hoje uma flexibilidade que só *talvez* seja necessária amanhã. Isso não significa código descuidado. Significa adiar decisões até existir uma necessidade concreta, confiando que os testes e a refatoração vão permitir mudar depois.

## Onde o código segue o design simples

### 1. Uma camada de acesso a dados com só três funções

```js
// bd/bd_utils.js
function query(query, params)    { return bd.prepare(query).get(params); }
function queryAll(query, params) { return bd.prepare(query).all(params); }
function exec(statement, params) { return bd.prepare(statement).run(params); }
```

Não há ORM, repositórios genéricos, *query builder* nem pool de conexões. Para um fórum com duas tabelas, SQL escrito à mão é mais legível do que qualquer abstração. Mesmo assim, essa camada mínima já cumpre a função mais importante: isolar o resto do código da biblioteca `better-sqlite3`. Os testes aproveitam exatamente isso para substituir o banco por um *mock* (`testes/modelo.test.js`).

### 2. Um único arquivo de rotas, sem camadas extras

```js
// server.js
app.post('/perguntas', (req, res) => {
  try {
    const id_pergunta = modelo.cadastrar_pergunta(req.body.pergunta);
    res.json({id_pergunta: id_pergunta});
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});
```

Com quatro endpoints, separar em `routes/`, `controllers/`, `services/` e `repositories/` seria criar quatro pastas para guardar quatro funções. Cada rota lê a requisição, chama uma função do modelo e devolve JSON, e isso se lê de cima a baixo sem abrir outro arquivo. (Na Parte 3 eu mostro o ponto em que essa estrutura deixa de ser suficiente, e por quê.)

### 3. CORS configurado à mão, sem dependência nova

```js
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

O frontend roda na porta 3000 e o backend na 5000, então é preciso liberar CORS. Em vez de instalar o pacote `cors`, o autor escreveu um middleware de cinco linhas. É uma troca consciente: uma dependência a menos para manter, ao custo de pouquíssimo código.

### 4. Acesso síncrono ao banco

O projeto usa `better-sqlite3`, cuja API é síncrona. Isso elimina *callbacks*, *promises* e `async/await` de todo o modelo. `listar_perguntas()` simplesmente retorna um array. Para SQLite local, que é rápido e roda no mesmo processo, a versão assíncrona traria complexidade sem ganho real.

### 5. Nada de funcionalidade especulativa

Não há autenticação, paginação, edição, exclusão nem cache. Nada disso foi pedido na versão atual, e nada disso foi construído "por precaução". Quando o cliente pediu funcionalidades novas (votação, busca, tags...), elas entraram no backlog para serem feitas quando forem priorizadas, e não antes.

## Oportunidades de simplificação

### 1. Uma dependência que não é usada: `sqlite3`

```json
"dependencies": {
  "better-sqlite3": "^11.0.0",
  "express": "^4.18.2",
  "sqlite3": "^5.1.7"
}
```

Nenhum arquivo do projeto faz `require('sqlite3')`; só o `better-sqlite3` é usado. É o caso clássico de YAGNI ao contrário: algo que ficou "para caso precise". E não é inofensivo. Foi justamente esse pacote que quebrou o meu `npm install`, porque ele precisa ser compilado em versões recentes do Node (detalhes em [INSTALACAO.md](INSTALACAO.md)). **Simplificação:** `npm uninstall sqlite3`. Menos código de terceiros, instalação mais rápida e um ponto de falha a menos.

### 2. Consulta N+1 em `listar_perguntas`

```js
// atual: 1 consulta para as perguntas + 1 consulta por pergunta
function listar_perguntas() {
  const perguntas = bd.queryAll('select * from perguntas', []);
  perguntas.forEach(pergunta =>
    pergunta['num_respostas'] = get_num_respostas(pergunta['id_pergunta']));
  return perguntas;
}
```

Com 100 perguntas, são 101 consultas. Uma única consulta resolve, e o código fica *menor*:

```js
// proposta: 1 consulta
function listar_perguntas() {
  return bd.queryAll(`
    SELECT p.*, COUNT(r.id_resposta) AS num_respostas
      FROM perguntas p
      LEFT JOIN respostas r ON r.id_pergunta = p.id_pergunta
     GROUP BY p.id_pergunta`, []);
}
```

Aqui vale uma ressalva honesta: com SQLite local e poucas perguntas, o desempenho não é problema, e por isso não dá para justificar a mudança só por performance. O argumento principal é que a versão nova tem **menos elementos** (uma função a menos, sem laço, sem mutação de objetos). O teste de unidade atual, que simula três chamadas a `query`, teria que ser reescrito, o que mostra que ele está acoplado a *como* a função é implementada, e não ao *que* ela retorna.

### 3. `try/catch` repetido em todas as rotas

As quatro rotas repetem o mesmo bloco. E, em `GET /respostas/:id_pergunta`, as chamadas ao modelo estão **fora** do `try`, então esse bloco não protege nada:

```js
app.get('/respostas/:id_pergunta', (req, res) => {
  const id_pergunta = req.params.id_pergunta;
  const pergunta = modelo.get_pergunta(id_pergunta);   // se falhar, o catch abaixo não pega
  const respostas = modelo.get_respostas(id_pergunta);
  try {
    res.json({ pergunta: pergunta, respostas: respostas });
  }
  catch(erro) { res.status(500).json(erro.message); }
});
```

Um único middleware de erro remove a duplicação e corrige o problema de uma vez:

```js
app.get('/respostas/:id_pergunta', (req, res) => {
  const id = req.params.id_pergunta;
  res.json({ pergunta: modelo.get_pergunta(id), respostas: modelo.get_respostas(id) });
});

// no final do server.js: trata erros de todas as rotas
app.use((erro, req, res, next) => res.status(500).json(erro.message));
```

(Rotas síncronas no Express 4 repassam exceções para o middleware de erro automaticamente.)

### 4. Pequenos ruídos que atrapalham a intenção

- `RETURNING id_pergunta` em `cadastrar_pergunta` e `cadastrar_resposta` não tem efeito, porque o código usa `.run()` e lê `lastInsertRowid`. Remover o `RETURNING` deixa o SQL dizer só o que importa.
- `get_num_respostas` lê o resultado como `resultado['count(*)']`. Um alias (`SELECT COUNT(*) AS total`) deixa o código autoexplicativo.
- O comentário de `listar_perguntas` diz que `texto` é `int`. Comentário desatualizado é pior do que nenhum comentário.

### 5. Um campo especulativo: `id_usuario`

A tabela `perguntas` tem `id_usuario NOT NULL`, mas não existe tabela de usuários, e o valor é sempre `1`:

```js
function cadastrar_pergunta(texto) {
  const params = [texto, 1];   // usuário "fixo"
  ...
```

É uma coluna criada para um futuro que ainda não chegou. Com as funcionalidades de perfil e votação no backlog, esse futuro agora é concreto, então não vou remover a coluna. Mas ela ilustra bem o custo do YAGNI ignorado: é uma informação que parece significativa e não é. E, por não haver `id_usuario` em `respostas`, ela nem seria suficiente para montar o histórico de usuário.

## Conclusão

O ESM Forum é um bom exemplo de design simples: pouco código, nenhuma abstração sem uso e testes que permitem mudar com segurança. As oportunidades que encontrei não pedem *mais* estrutura. Todas elas reduzem o número de elementos (uma dependência, um laço, blocos `try/catch` duplicados, SQL redundante), e isso é exatamente o que as regras de Beck pedem. A pressão por mais estrutura só vai aparecer quando as cinco funcionalidades novas chegarem. Esse é o tema da Parte 3.
