# Pair Programming: como eu aplicaria esta prática

Estou fazendo o projeto individualmente, então este documento descreve como eu aplicaria pair programming se tivesse um par, e também o que eu faço, trabalhando sozinha, para aproveitar parte dos benefícios da prática.

## Por que parear neste projeto

No XP, pair programming não é "duas pessoas no mesmo computador por falta de máquina". É uma forma de revisar o código continuamente, no momento em que ele é escrito. O **driver** está no teclado e pensa taticamente (esta linha, este teste). O **navigator** pensa estrategicamente: se o design faz sentido, que caso de teste está faltando, se isso já existe em outro lugar do código.

Para o ESM Forum, os benefícios mais concretos seriam:

- **Transferência de conhecimento.** O backend e o frontend estão em repositórios separados. Em par, ninguém vira "a pessoa do React" ou "a pessoa do banco".
- **Decisões de design melhores nas funcionalidades que mexem no modelo de dados.** Votação, perfil e notificação exigem introduzir usuários no sistema. É o tipo de decisão em que uma segunda opinião, na hora, evita retrabalho.
- **Menos defeitos.** Erros como o `try/catch` que não protege as chamadas em `GET /respostas/:id_pergunta` (ver [DESIGN_SIMPLES.md](DESIGN_SIMPLES.md)) são justamente os que o navigator costuma pegar.

## Estratégia

Eu não parearia 100% do tempo. Usaria o par onde ele rende mais:

| Situação | Pareia? | Por quê |
|---|---|---|
| Mudanças no esquema do banco (tabelas de tags, votos, usuários) | **Sim** | Decisões difíceis de desfazer. |
| Primeira implementação de um padrão novo no código (ex.: a estrutura SOLID da busca) | **Sim** | Define o molde que o resto do código vai seguir. |
| Escrita dos testes de aceitação de cada história | **Sim** | Força os dois a concordarem sobre o que é "pronto". |
| Ajustes visuais no frontend, textos, documentação | Não | Baixo risco. Basta uma revisão assíncrona via Pull Request. |
| Tarefas repetitivas (ex.: criar vários cards no board) | Não | Não há decisão a discutir. |

### Formato das sessões

- **Duração:** blocos de 90 minutos, com pausa de 10 minutos no meio. Pareamento remoto cansa mais do que presencial, e sessões longas demais derrubam a atenção do navigator.
- **Início de cada sessão (5 min):** escolher um card do board (sempre o do topo da coluna "Pronto para desenvolver", ver [PROCESSO.md](PROCESSO.md)) e combinar o objetivo da sessão ("sair daqui com o endpoint de busca passando nos testes").
- **Estilo ping-pong com TDD:** a pessoa A escreve um teste que falha; a pessoa B faz o teste passar e escreve o próximo teste que falha; e assim por diante. Isso garante a troca natural de papéis e mantém o ritmo de TDD.
- **Final de cada sessão (5 min):** commit com as duas autorias (ver abaixo), atualização do card no board e uma nota rápida do que ficou pendente.

## Rotação de papéis (driver e navigator)

- **Troca a cada 25 minutos** (um "pomodoro"), com um temporizador visível para os dois. Sem rotação por tempo, quem digita mais rápido tende a ficar com o teclado a sessão toda.
- **No ping-pong**, a troca acontece a cada ciclo de teste, que costuma ser até mais frequente que 25 minutos.
- **Regras para o navigator:** não dita código tecla por tecla; aponta problemas pela intenção ("esse caso de lista vazia está coberto?"); anota as ideias que surgirem e não cabem agora, para não desviar o foco.
- **Regras para o driver:** pensa em voz alta. Se o navigator não entende o que está sendo digitado, é hora de parar e conversar.
- **Rodízio de pares:** com mais de duas pessoas no time, eu trocaria os pares a cada funcionalidade, para espalhar o conhecimento.

## Ferramentas

| Necessidade | Ferramenta | Observação |
|---|---|---|
| Edição colaborativa do código | **VS Code Live Share** | Os dois editam o mesmo workspace em tempo real, cada um com seu cursor. O convidado não precisa clonar o repositório nem instalar dependências. |
| Terminal e servidor compartilhados | Live Share (terminal compartilhado + *port forwarding* das portas 3000 e 5000) | O navigator vê os testes rodando e acessa o frontend na própria máquina. |
| Voz e vídeo | **Discord** (canal de voz fixo do projeto) | Fica aberto durante a sessão. Compartilhamento de tela só quando for preciso mostrar o navegador. |
| Temporizador de rotação | Qualquer timer de pomodoro visível para os dois | Pode ser um bot do Discord. |
| Registro de autoria | `Co-authored-by:` na mensagem de commit | O GitHub mostra os dois autores no commit. |

Exemplo de commit pareado:

```
Implementa endpoint GET /perguntas/busca

Co-authored-by: Nome do Par <email-do-par@exemplo.com>
```

## E trabalhando sozinha?

Sem um par, tento cobrir os dois papéis de forma deliberada:

- **Separo "escrever" de "revisar".** Abro um Pull Request para mim mesma e só faço o merge depois de reler o diff no dia seguinte, com o olhar de navigator.
- **Teste primeiro.** Escrever o teste antes me obriga a pensar na interface e nos casos de borda, que é o que um navigator faria.
- **Rubber duck.** Explico em voz alta (ou por escrito, no PR) o que o código faz. Se a explicação trava, o código provavelmente precisa melhorar.
- **Uso de assistente de IA como "navigator".** Peço a revisão de um trecho específico, com a mesma disciplina de papéis: eu decido e digito, a ferramenta questiona. É útil, mas não substitui um colega que conhece o contexto e discorda de verdade.
