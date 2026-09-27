# Projeto Final: Engenharia de Software I (FGV)

**Aluna:** Claudia Lecarnaque (trabalho individual)

**Repositórios:**
- Backend (fork de `jeffsantos/esmforum`): https://github.com/ClaudiaLecarnaque/fgv-profinal-esmforum
- Frontend (fork de `jeffsantos/esmforum-react`): https://github.com/ClaudiaLecarnaque/fgv-profinal-esmforum-react
- Board no GitHub Projects: https://github.com/users/ClaudiaLecarnaque/projects/1

Este arquivo é o índice de todas as entregas. Os documentos ficam na raiz deste repositório. Os diagramas ficam em [`diagramas/`](diagramas/), sempre em dois formatos: fonte Mermaid (`.mmd`) e imagem (`.png`).

---

## Parte 1: Planejamento e Práticas Ágeis

| Tarefa | Pontos | Entrega |
|---|---|---|
| 1. Configuração do ambiente | 1.0 | [INSTALACAO.md](INSTALACAO.md) (e `INSTALACAO.md` no repositório do frontend) |
| 2a. Escolha do processo (Kanban) | 2.0 | [PROCESSO.md](PROCESSO.md) |
| 2b. Estruturação do board | 3.0 | [Board no GitHub Projects](https://github.com/users/ClaudiaLecarnaque/projects/1). Colunas, limites de WIP e priorização em [PROCESSO.md](PROCESSO.md) |
| 3a. Design Simples | 2.0 | [DESIGN_SIMPLES.md](DESIGN_SIMPLES.md) |
| 3b. Pair Programming | 2.0 | [PAIR_PROGRAMMING.md](PAIR_PROGRAMMING.md) |

## Parte 2: Requisitos e Modelagem

| Tarefa | Pontos | Entrega |
|---|---|---|
| 1. Histórias de usuário + priorização | 2.0 | [HISTORIAS.md](HISTORIAS.md) |
| 2. Caso de uso detalhado | 1.5 | [CASO_DE_USO.md](CASO_DE_USO.md) |
| 3a. Diagrama de classes | 2.0 | [diagrama_classes.png](diagramas/diagrama_classes.png) · [.mmd](diagramas/diagrama_classes.mmd) |
| 3b. Diagrama de sequência | 2.0 | [diagrama_sequencia.png](diagramas/diagrama_sequencia.png) · [.mmd](diagramas/diagrama_sequencia.mmd) |
| 3c. Diagrama de atividades | 1.5 | [diagrama_atividades.png](diagramas/diagrama_atividades.png) · [.mmd](diagramas/diagrama_atividades.mmd) |
| 3d. Diagrama de estados | 1.0 | [diagrama_estados.png](diagramas/diagrama_estados.png) · [.mmd](diagramas/diagrama_estados.mmd) |
| Explicação dos diagramas | — | [DIAGRAMAS_UML.md](DIAGRAMAS_UML.md) |

## Parte 3: Desenvolvimento Iterativo-Incremental

| Iteração | Tarefa | Pontos | Entrega |
|---|---|---|---|
| 1: SOLID | 1. Análise SOLID | 1.5 | [ANALISE_SOLID.md](ANALISE_SOLID.md) |
| 1: SOLID | 2. Implementação com SOLID | 2.0 | Código em [`busca/`](busca/), rota em [`server.js`](server.js), testes em [`testes/busca/`](testes/busca/), frontend em `esmforum-react/src/pages/BuscaPerguntas.js` · [IMPLEMENTACAO_SOLID.md](IMPLEMENTACAO_SOLID.md) |
| 2: Padrões | 3. Padrões existentes | 1.0 | [PADROES_EXISTENTES.md](PADROES_EXISTENTES.md) |
| 2: Padrões | 4. Padrões propostos | 2.5 | [PADROES_PROPOSTOS.md](PADROES_PROPOSTOS.md) + [observer](diagramas/padrao_observer.png) · [strategy](diagramas/padrao_strategy.png) · [decorator](diagramas/padrao_decorator.png) |
| 3: Arquitetura | 5. Análise arquitetural | 1.0 | [ARQUITETURA.md](ARQUITETURA.md) + [diagrama](diagramas/arquitetura_atual.png) |
| 3: Arquitetura | 6. Proposta arquitetural | 2.0 | [PROPOSTA_ARQUITETURA.md](PROPOSTA_ARQUITETURA.md) + [camadas](diagramas/proposta_camadas.png) · [MVC](diagramas/proposta_mvc.png) · [fluxo](diagramas/proposta_fluxo_votacao.png) |

---

## Uso de assistente de IA

Declaro que usei o **Claude** (assistente de IA da Anthropic) ao longo de todo o projeto, como apoio ao desenvolvimento. Ele me ajudou a analisar o código original do ESM Forum, a redigir os documentos das três partes, a gerar os diagramas em Mermaid, a implementar a busca por palavra-chave e seus testes automatizados, e a organizar os commits e os forks no GitHub.

As decisões do projeto foram minhas: fazer o trabalho individualmente, o escopo de cada entrega, a escolha do Kanban e da ordem de prioridade das funcionalidades, e a montagem do board no GitHub Projects. Revisei o conteúdo produzido antes de publicá-lo. O código foi validado com a execução dos testes (`npm test`) e com o uso da busca no navegador.

## Como executar e testar

```bash
# backend
npm install
npm test          # 37 testes
node server.js    # http://localhost:5000

# frontend (no repositório fgv-profinal-esmforum-react)
npm install
npm start         # http://localhost:3000
```

Detalhes e solução de problemas em [INSTALACAO.md](INSTALACAO.md).

## Como regenerar os diagramas

```bash
npx @mermaid-js/mermaid-cli -i diagramas/<nome>.mmd -o diagramas/<nome>.png -s 2 -b white
```

Os arquivos `.mmd` também podem ser colados em [mermaid.live](https://mermaid.live) para edição visual.

## Linha condutora

As três partes contam uma história só. A Parte 1 prioriza a **busca** como primeira entrega (maior valor, menor esforço, sem dependências). A Parte 2 a detalha como caso de uso e diagrama de sequência. A Parte 3 a implementa com SOLID, usando exatamente as classes que aparecem no diagrama de sequência. As propostas de padrões e de arquitetura partem dessa implementação para mostrar como as funcionalidades seguintes (votação e notificação) se encaixariam.
