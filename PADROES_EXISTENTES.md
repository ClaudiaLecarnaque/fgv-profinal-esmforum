# Padrões de Projeto já presentes no ESM Forum

O ESM Forum é pequeno e não foi escrito "aplicando padrões". Mesmo assim, vários padrões aparecem nele, alguns explícitos no código do projeto, outros trazidos pelas bibliotecas que ele usa (Express e React). Separei o que encontrei no **código original** do que eu **introduzi** na implementação da busca.

## Resumo

| Padrão | Categoria | Onde | Implementação |
|---|---|---|---|
| Facade | Estrutural | `bd/bd_utils.js` | Completa para o uso atual |
| Singleton | Criacional | `bd/bd_utils.js` (conexão única) | Parcial: é um "singleton por acidente" do cache de módulos do Node |
| Chain of Responsibility | Comportamental | `server.js` (middlewares do Express) | Completa, fornecida pelo framework |
| Composite | Estrutural | Frontend: árvore de componentes React | Completa, fornecida pelo framework |
| Observer | Comportamental | Frontend: estado (`useState`) e callbacks `update` | Completa no React; manual e frágil nos callbacks |
| MVC | Arquitetural | Organização geral do sistema | Parcial (detalhado em [ARQUITETURA.md](ARQUITETURA.md)) |
| *Strategy* | Comportamental | `busca/criterios/` | **Introduzido por mim** na Parte 3 |
| *Repository* | (Fowler, PoEAA) | `busca/repositorio_perguntas*.js` | **Introduzido por mim** na Parte 3 |

---

## 1. Facade: `bd/bd_utils.js`

**O padrão.** O Facade oferece uma interface simples e unificada para um subsistema complexo.

**Onde está.** O `better-sqlite3` exige preparar um *statement* e escolher entre `.get()`, `.all()` e `.run()`, e ainda oferece transações, *pragmas*, funções definidas pelo usuário etc. O `bd_utils` esconde tudo isso atrás de três funções:

```js
function query(query, params)    { return bd.prepare(query).get(params); }
function queryAll(query, params) { return bd.prepare(query).all(params); }
function exec(statement, params) { return bd.prepare(statement).run(params); }
```

O `modelo.js` nunca vê um `Statement` nem um `Database`. Só vê "consulte" e "execute".

**Avaliação: completa para o uso atual.** Uma melhoria possível seria expor uma operação de **transação** (por exemplo, `transacao(fn)`). A votação vai precisar disso: "remover voto antigo + inserir voto novo" deve ser atômico, e hoje a fachada não oferece essa operação.

*Menção honrosa:* o `modelo.js` funciona como uma segunda fachada, agora para o `server.js`: as rotas chamam `listar_perguntas()` sem saber que existem SQL ou tabelas.

## 2. Singleton: a conexão com o banco

**O padrão.** O Singleton garante que uma classe tenha uma única instância, com um ponto global de acesso.

**Onde está.** Em `bd_utils.js`, a conexão é criada uma única vez, no nível do módulo:

```js
var bd = new Database('./bd/esmforum.db');
```

Como o Node guarda em cache cada módulo depois do primeiro `require`, todos os arquivos que importam `bd_utils` compartilham **a mesma conexão**. Na prática, é um Singleton.

**Avaliação: parcial, e com os problemas clássicos do padrão.**
- É um Singleton "por acidente" do cache de módulos, não uma decisão de design explícita.
- `reconfig(nome)` troca a instância **global**. Se um teste reconfigura o banco, todos os outros módulos passam a usar o banco novo. Foi isso que me obrigou a rodar os testes em sequência (`--runInBand`), já que dois arquivos de teste em paralelo compartilham o mesmo banco.
- A conexão é aberta no `require`, com caminho fixo, o que é a violação de DIP descrita em [ANALISE_SOLID.md](ANALISE_SOLID.md).

**Como melhorar.** Manter uma instância única em produção, mas **criada e distribuída pela raiz de composição** (`const bd = conectar(caminho)`), e não por um estado global escondido. Assim se tem a vantagem do Singleton (uma conexão só) sem o acoplamento.

## 3. Chain of Responsibility: middlewares do Express

**O padrão.** O Chain of Responsibility passa uma requisição por uma cadeia de tratadores. Cada tratador decide se processa a requisição e se a repassa para o próximo.

**Onde está.** Em `server.js`, cada `app.use(...)` acrescenta um elo à cadeia, e a chamada `next()` repassa para o elo seguinte:

```js
app.use(express.json());                     // elo 1: converte o corpo JSON
app.use((req, res, next) => {                // elo 2: adiciona cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  // ...
  next();                                    // repassa adiante
});
app.get('/', (req, res) => { /* ... */ });   // elo final: a rota
```

**Avaliação: completa**, porque é fornecida pelo próprio Express. O projeto poderia aproveitá-la mais: o `try/catch` repetido em todas as rotas deveria ser **um elo de tratamento de erros** no fim da cadeia (`app.use((erro, req, res, next) => ...)`), como proposto em [DESIGN_SIMPLES.md](DESIGN_SIMPLES.md).

## 4. Composite: árvore de componentes React

**O padrão.** O Composite compõe objetos em estruturas de árvore e permite tratar objetos individuais e composições da mesma forma.

**Onde está.** No frontend, `App` contém `Menu`, que contém `Pergunta`, que contém `TabelaPerguntas`, que contém `TabelaPrincipal`, que contém várias `LinhaTabela`. Folhas e contêineres são todos "componentes" e são renderizados da mesma maneira: `<Componente props />`.

```jsx
<Route path="/" element={<Menu />}>
  <Route index element={<Pergunta />} />
  <Route path="resposta/:id_pergunta" element={<Resposta />} />
</Route>
```

**Avaliação: completa** (é o modelo do próprio React). Um ponto a melhorar no uso: `TabelaPerguntas` e `TabelaPrincipal` são **declarados dentro** do componente `Pergunta`, então são recriados a cada renderização. Isso descarta o estado interno deles (por exemplo, o texto digitado em `NovaPergunta` se perde quando a lista é atualizada). Por esse motivo, criei o `BuscaPerguntas` em um arquivo próprio.

## 5. Observer: estado e callbacks no React

**O padrão.** O Observer define uma dependência um-para-muitos: quando um objeto muda de estado, os dependentes são notificados automaticamente.

**Onde está.**
- **No React:** `useState` é um Observer. Quando `setListaPerguntas(...)` muda o estado, o React notifica o componente e seus filhos, que são renderizados de novo.
- **Nos callbacks do projeto:** `NovaPergunta` recebe `props.update` e o chama quando o servidor confirma o cadastro. O componente pai "observa" o filho:

```js
function postPergunta(pergunta, update) {
  fetch('http://localhost:5000/perguntas', request)
    .then(response => response.json())
    .then(data => update(data.id_pergunta, pergunta));   // notifica o observador
}
```

**Avaliação: completa no mecanismo do React, rudimentar nos callbacks.** Há um só observador por evento, passado manualmente por *props*. Isso funciona para um nível de profundidade, mas não escala: se o `Menu` precisasse mostrar um contador de perguntas, o callback teria que atravessar vários componentes. Nesse caso, um Context do React ou um *store* de estado seria o Observer adequado. No **backend não há Observer nenhum**, e é por isso que o proponho para a funcionalidade de notificações em [PADROES_PROPOSTOS.md](PADROES_PROPOSTOS.md).

## 6. MVC (padrão arquitetural)

A própria documentação do projeto (`docs/arquitetura.md`) descreve o sistema como uma variação de MVC: Visão = SPA React, Controlador = `server.js`, Modelo = `modelo.js`. **Avaliação: parcial.** O modelo mistura regra de negócio e SQL, e não há uma camada de "visão" no backend que formate as respostas JSON. As rotas devolvem direto o que vem do banco. Esses pontos são tratados em [ARQUITETURA.md](ARQUITETURA.md) e [PROPOSTA_ARQUITETURA.md](PROPOSTA_ARQUITETURA.md).

---

## Padrões que introduzi na Parte 3

- **Strategy** (`busca/criterios/`): cada critério de busca é uma estratégia intercambiável, com o contrato `seAplica`/`atende`. O `ServicoBusca` é o *contexto* que usa as estratégias sem conhecê-las. É o que viabiliza o OCP (ver [IMPLEMENTACAO_SOLID.md](IMPLEMENTACAO_SOLID.md)).
- **Repository** (`RepositorioPerguntas` e `RepositorioPerguntasSQLite`): não é um padrão do catálogo GoF, e sim do catálogo de Martin Fowler (*Patterns of Enterprise Application Architecture*). Isola o acesso a dados atrás de uma interface orientada ao domínio ("liste as perguntas com contagem de respostas"), em vez de SQL genérico.
- **Composition Root** (`busca/index.js`): uma função fábrica que concentra a criação e a ligação dos objetos concretos. É uma aplicação simples da ideia do padrão Factory.
