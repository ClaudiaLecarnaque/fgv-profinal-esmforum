# Análise SOLID do código existente

A análise se refere ao código **original** do backend, antes das minhas alterações (commit `e819f6d` do repositório base). Como explico em [DESIGN_SIMPLES.md](DESIGN_SIMPLES.md), não existem as pastas `routes/` e `models/`: as rotas estão em `server.js`, o modelo em `modelo.js` e o acesso ao banco em `bd/bd_utils.js`. Os números de linha abaixo se referem a esses arquivos.

Um lembrete rápido dos cinco princípios:

| | Princípio | Em uma frase |
|---|---|---|
| **S** | Responsabilidade Única (SRP) | Um módulo deve ter um único motivo para mudar. |
| **O** | Aberto/Fechado (OCP) | Deve ser possível estender o comportamento sem modificar o código existente. |
| **L** | Substituição de Liskov (LSP) | Um substituto deve poder ocupar o lugar do original sem quebrar quem o usa. |
| **I** | Segregação de Interfaces (ISP) | Clientes não devem depender de operações que não usam. |
| **D** | Inversão de Dependência (DIP) | Módulos de alto nível devem depender de abstrações, e não de detalhes concretos. |

---

## a) Pontos positivos

### 1. `bd/bd_utils.js` segue o **SRP**

```js
// bd/bd_utils.js (linhas 1-21)
const Database = require('better-sqlite3');
var bd = new Database('./bd/esmforum.db');

function reconfig(nome)          { bd = new Database(nome); }
function query(query, params)    { return bd.prepare(query).get(params); }
function queryAll(query, params) { return bd.prepare(query).all(params); }
function exec(statement, params) { return bd.prepare(statement).run(params); }
```

Este módulo tem uma única responsabilidade: **falar com a biblioteca de banco de dados**. Ele não sabe o que é uma pergunta nem uma resposta, e não sabe nada de HTTP. Ele só executa SQL.

O teste do SRP é perguntar "o que faria este arquivo mudar?". A resposta tem um motivo só: trocar a biblioteca de acesso (por exemplo, de `better-sqlite3` para `pg`, se o fórum migrasse para PostgreSQL). Uma regra nova de negócio, como "perguntas precisam ter tags", não encosta neste arquivo. É o único arquivo do projeto que importa `better-sqlite3`, então o impacto de uma troca de biblioteca fica contido aqui.

### 2. `modelo.reconfig_bd()` aplica a **Inversão de Dependência (DIP)**, ainda que parcialmente

```js
// modelo.js (linhas 1-7)
var bd = require('./bd/bd_utils.js');

// usada pelo teste de unidade
// para que o modelo passe a usar uma versão "mockada" de bd
function reconfig_bd(mock_bd) {
  bd = mock_bd;
}
```

O `modelo.js` (alto nível: regras sobre perguntas e respostas) não depende rigidamente do `bd_utils` (baixo nível). Ele depende de **qualquer objeto** que ofereça `query`, `queryAll` e `exec`. Essa é a abstração, mesmo sem uma interface formal, já que JavaScript não tem interfaces. O teste `testes/modelo.test.js` prova que isso funciona na prática:

```js
var mock_bd = {};
mock_bd.queryAll = jest.fn().mockReturnValue([ /* 3 perguntas */ ]);
mock_bd.query = jest.fn().mockReturnValue({ 'count(*)': 0 }) /* ... */;
modelo.reconfig_bd(mock_bd);   // o modelo passa a usar o mock
```

Com isso, o modelo pode ser testado **sem banco de dados**, que é o principal benefício prático do DIP. Esse caso também ilustra o **LSP**: o `mock_bd` substitui o `bd_utils` sem que `listar_perguntas()` perceba a diferença.

Chamo de "parcial" porque o modelo ainda faz `require` do módulo concreto na linha 1, e a injeção é feita trocando uma variável global do módulo (*setter injection*). A versão completa receberia a dependência pelo construtor, como fiz na busca (ver [IMPLEMENTACAO_SOLID.md](IMPLEMENTACAO_SOLID.md)).

### 3. A interface de `bd_utils` é enxuta: **Segregação de Interfaces (ISP)**

```js
// bd/bd_utils.js (linhas 23-26)
exports.reconfig = reconfig;
exports.query = query;
exports.queryAll = queryAll;
exports.exec = exec;
```

O objeto `Database` do `better-sqlite3` tem dezenas de métodos (`transaction`, `pragma`, `backup`, `function`, `aggregate`, `loadExtension`, `close`...). O `bd_utils` **não** repassa esse objeto para o resto do sistema. Ele expõe só as três operações de que o modelo precisa: buscar uma linha, buscar várias e executar um comando.

A consequência aparece no teste acima: o mock só precisa implementar `query` e `queryAll`, que são as duas funções que `listar_perguntas` realmente usa. Se o modelo dependesse do objeto `Database` inteiro, qualquer dublê de teste teria que imitar uma interface enorme. Uma interface pequena e focada no cliente é exatamente o que o ISP pede.

---

## b) Oportunidades de melhoria

### 1. `modelo.js` viola o **SRP** (e, por consequência, o **OCP**)

```js
// modelo.js (linhas 15-31)
function listar_perguntas() {
  const perguntas = bd.queryAll('select * from perguntas', []);                    // SQL
  perguntas.forEach(pergunta =>
    pergunta['num_respostas'] = get_num_respostas(pergunta['id_pergunta']));       // regra de composição
  return perguntas;
}

function cadastrar_pergunta(texto) {
  const params = [texto, 1];                                                        // regra: autor fixo
  const result = bd.exec('INSERT INTO perguntas (texto, id_usuario) VALUES(?, ?) RETURNING id_pergunta', params);
  return result.lastInsertRowid;
}

function cadastrar_resposta(id_pergunta, texto) { /* SQL de respostas */ }
```

**Qual é o problema.** Um único módulo concentra muitos motivos para mudar:
- **duas entidades diferentes** (perguntas e respostas);
- **regras de negócio** (quem é o autor, como se conta respostas, o que é uma pergunta válida);
- **SQL** (nomes de tabelas e colunas, consultas).

Uma mudança no esquema do banco, uma regra nova de validação e uma funcionalidade nova passam todas por este arquivo. Isso leva direto a uma violação do **OCP**: cada uma das cinco funcionalidades pedidas pelo cliente (votos, tags, busca, perfil, notificação) obrigaria a **modificar** `modelo.js`, em vez de **acrescentar** código novo. Por exemplo, ordenar por "mais votadas" exigiria alterar `listar_perguntas` para incluir votos e um parâmetro de ordenação.

**Como melhorar.**
- Separar o acesso a dados por entidade em **repositórios** (`RepositorioPerguntas`, `RepositorioRespostas`), responsáveis só pelo SQL.
- Colocar as regras em **serviços** (`ServicoPerguntas`, `ServicoRespostas`), que usam os repositórios.
- Para comportamentos que variam (filtros, ordenações), usar objetos intercambiáveis (padrão Strategy), para que um comportamento novo seja uma classe nova.

Foi exatamente essa estrutura que usei na busca: `RepositorioPerguntasSQLite` só faz SQL, `ServicoBusca` só orquestra, e cada critério é uma classe. Acrescentar o filtro "só sem resposta" não exigiu tocar no serviço.

### 2. `server.js` e `bd_utils.js` violam a **Inversão de Dependência (DIP)**

```js
// server.js (linhas 1-2)
const express = require('express')
const modelo = require('./modelo.js');      // dependência concreta, fixada no require

// bd/bd_utils.js (linha 3)
var bd = new Database('./bd/esmforum.db');  // conexão criada ao importar o módulo, com caminho fixo
```

**Qual é o problema.** A camada de alto nível (as rotas HTTP) depende diretamente de um módulo concreto, e esse módulo, ao ser importado, **já abre** o arquivo `./bd/esmforum.db`. Não existe um ponto em que alguém de fora decida *qual* modelo ou *qual* banco usar. As consequências práticas são:

- **As rotas não podem ser testadas isoladamente.** Qualquer teste que importe `server.js` abre o banco de produção. Além disso, o `server.js` original chamava `app.listen(5000)` no nível do módulo, então importá-lo num teste abria a porta 5000 (corrigi isso: agora o app é exportado e só escuta quando executado diretamente).
- **O caminho do banco depende do diretório de execução.** Rodar `node esmforum/server.js` a partir de outra pasta faz a aplicação falhar ao iniciar ("directory does not exist"). Pior: se por acaso existir uma pasta `bd/` no diretório atual, o SQLite cria ali um banco vazio, e a aplicação sobe aparentemente normal, mas sem dados.
- **A troca de banco para testes** depende de lembrar de chamar `bd.reconfig()` antes de tudo, que é o que os testes de integração fazem no `beforeEach`.

**Como melhorar.**
- **Injetar as dependências** em vez de importá-las diretamente: uma função `criarApp({ servicoPerguntas, servicoBusca })` monta as rotas com os serviços recebidos. Em produção, a raiz de composição passa as implementações reais; nos testes, dublês.
- **Não criar a conexão como efeito colateral do `require`**: exportar uma função `conectar(caminho)` e ler o caminho de uma variável de ambiente (`process.env.ESMFORUM_BD ?? path.join(__dirname, 'esmforum.db')`).

```js
// proposta
function criarApp({ servicoPerguntas, servicoBusca }) {
  const app = express();
  app.get('/', (req, res) => res.json(servicoPerguntas.listar()));
  app.get('/perguntas/busca', (req, res) => { /* usa servicoBusca */ });
  return app;
}

// raiz de composição (index.js)
const bd = conectar(process.env.ESMFORUM_BD);
criarApp({
  servicoPerguntas: new ServicoPerguntas(new RepositorioPerguntasSQLite(bd)),
  servicoBusca: criarServicoBusca(bd),
}).listen(5000);
```

Na busca, apliquei essa ideia em escala menor: o `ServicoBusca` recebe o repositório e os critérios pelo construtor, e só `busca/index.js` conhece as classes concretas.
