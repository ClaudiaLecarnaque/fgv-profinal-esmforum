# Instalação e execução do ESM Forum

Este documento descreve como instalei e executei localmente o backend (este repositório) e o frontend (esmforum-react) do ESM Forum, incluindo os problemas que encontrei no caminho e como os resolvi.

> Os links para os forks estão no [README do projeto final](PROJETO_FINAL.md).

## Pré-requisitos

| Ferramenta | Versão usada | Observação |
|---|---|---|
| Git | 2.x | para clonar os forks |
| Node.js | 22.x (LTS) | o CI do projeto usa Node 18, mas funciona em versões mais novas |
| npm | 10.x | vem junto com o Node |
| Python 3 + compilador C/C++ | — | só necessários se o `npm install` precisar compilar módulos nativos (ver "Problemas encontrados") |

Não é preciso instalar o SQLite separadamente para rodar o sistema: a biblioteca `better-sqlite3` já embute o SQLite. O executável `sqlite3` só é útil para recriar o banco com o script `bd/criar_bd.sh`.

## 1. Fork e clone

1. No GitHub, fiz fork de [jeffsantos/esmforum](https://github.com/jeffsantos/esmforum) e de [jeffsantos/esmforum-react](https://github.com/jeffsantos/esmforum-react).
2. Clonei os dois forks lado a lado:

```bash
git clone https://github.com/<meu-usuario>/esmforum.git
git clone https://github.com/<meu-usuario>/esmforum-react.git
```

## 2. Backend (Node.js + Express + SQLite)

```bash
cd esmforum
npm install
node server.js
```

Saída esperada:

```
ESM Forum rodando em 5000
```

Para conferir se a API está no ar:

```bash
curl http://localhost:5000/              # lista de perguntas (JSON)
curl http://localhost:5000/respostas/1   # pergunta 1 e suas respostas
```

### Testes do backend

```bash
npx jest
```

Resultado obtido: `Test Suites: 2 passed` / `Tests: 3 passed` (antes das minhas alterações). Depois da implementação da Parte 3, a suíte passou a ter mais testes, todos passando.

> Atenção: o teste de integração apaga e recria dados em `bd/esmforum-teste.db`. Se o Git mostrar esse arquivo como modificado depois de rodar os testes, basta `git checkout bd/esmforum-teste.db`.

### Zerar o banco de dados (opcional)

```bash
cd bd
./criar_bd.sh      # exige o executável sqlite3 instalado
```

## 3. Frontend (React)

Em outro terminal, com o backend rodando:

```bash
cd esmforum-react
npm install
npm start
```

O navegador abre em `http://localhost:3000`. A página inicial lista as perguntas buscadas em `http://localhost:5000`, e é possível cadastrar perguntas e respostas.

## Problemas encontrados

**`npm install` do backend falhou compilando o pacote `sqlite3`.** O `package.json` declara duas bibliotecas de SQLite: `better-sqlite3` (a que o código realmente usa, em `bd/bd_utils.js`) e `sqlite3` (que não é importada em nenhum arquivo). Em versões recentes do Node não há binário pré-compilado do `sqlite3@5`, então o npm tenta compilá-lo com `node-gyp`, que precisa baixar os headers do Node e ter Python e compilador C++ instalados. No meu ambiente o download dos headers foi bloqueado. Resolvi apontando o `node-gyp` para os headers da própria instalação do Node:

```bash
npm_config_nodedir=$(dirname $(dirname $(which node))) npm install
```

Outras saídas possíveis: instalar as ferramentas de build (`sudo apt install build-essential python3` no Linux, ou `xcode-select --install` no macOS), ou usar Node 18/20, para os quais existem binários prontos. A causa raiz é uma dependência que não é usada; discuto isso em [DESIGN_SIMPLES.md](DESIGN_SIMPLES.md).

**Porta 5000 ocupada no macOS.** Em versões recentes do macOS, o "Receptor AirPlay" usa a porta 5000. Se o servidor não subir, desative esse recurso em *Ajustes do Sistema → Geral → AirDrop e Handoff*.

**`localhost` vs `[::1]`.** Como o servidor escuta em `'localhost'`, algumas ferramentas (Thunder Client, Postman) podem tentar IPv6. Se der erro de conexão, use `http://127.0.0.1:5000`.
