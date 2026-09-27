# Processo de desenvolvimento: Kanban

**Board no GitHub Projects:** https://github.com/users/ClaudiaLecarnaque/projects/1

## Qual processo escolhi

Escolhi o **Kanban**. A decisão veio menos de uma preferência pessoal e mais do formato real deste projeto: sou uma desenvolvedora só, trabalhando em paralelo com outras atividades, com cinco funcionalidades pequenas e bastante independentes entre si, e com entregas que seguem o calendário da disciplina (semanas 3, 6 e 9) e não um ciclo fixo de sprints.

## O que caracteriza o Kanban (e o que eu uso dele)

O Kanban nasceu no Sistema Toyota de Produção e foi adaptado para software por David Anderson. Diferente do Scrum, ele não prescreve papéis, cerimônias nem iterações de tamanho fixo. Ele se apoia em poucas práticas:

1. **Visualizar o fluxo de trabalho.** Cada funcionalidade é um card que anda da esquerda para a direita no board. Olhando o board, sei imediatamente o que está parado, o que está em andamento e o que já foi entregue.
2. **Limitar o trabalho em progresso (WIP).** Esta é a regra que faz diferença de verdade. Com limite de WIP, eu termino uma coisa antes de começar outra. Trabalhando sozinha e com o tempo picado, o risco maior não é ficar sem tarefa: é ter cinco coisas pela metade na semana da entrega.
3. **Puxar trabalho, não empurrar.** Um card só entra em "Em andamento" quando há espaço dentro do limite, e eu puxo sempre o card do topo da coluna "Pronto para desenvolver", que já está ordenada por prioridade.
4. **Tornar as políticas explícitas.** Cada coluna tem um critério de entrada claro (ver abaixo), então "pronto" significa a mesma coisa em todos os cards.
5. **Medir e melhorar o fluxo.** O indicador mais simples é o *lead time*, isto é, quanto tempo um card leva de "Pronto para desenvolver" até "Concluído". Se um card fica parado muito tempo em "Revisão e testes", é sinal de que estou deixando os testes para o fim.

## Por que não Scrum

O Scrum é um ótimo framework, mas várias das suas peças não fazem sentido para uma pessoa só:

- **Papéis.** O Scrum separa Product Owner, Scrum Master e Developers. Aqui eu acumularia os três, e o PO "real" é o enunciado da disciplina. Simular reuniões entre mim e eu mesma seria cerimônia sem valor.
- **Sprints de tamanho fixo.** As entregas da disciplina não coincidem com sprints regulares: a Parte 1 é quase só planejamento, a Parte 3 concentra implementação. No Kanban, o calendário de entregas vira apenas um marco de data nos cards, sem forçar o trabalho a caber em caixas de duas semanas.
- **Compromisso de sprint.** No Scrum, o escopo do sprint fica protegido depois do planning. Aqui, o cliente pode mudar a prioridade a qualquer momento (e o próprio enunciado muda o foco entre as partes). O Kanban aceita repriorizar a coluna "Pronto para desenvolver" sem quebrar nenhuma regra do processo.

Eu mudaria de ideia se a equipe crescesse (por exemplo, quatro ou cinco pessoas trabalhando em paralelo). Nesse caso, as cerimônias do Scrum (daily, review, retrospectiva) passam a ter valor real de sincronização, e um Product Owner dedicado ajudaria a proteger o foco do time.

## Estrutura do board

| Coluna | Limite de WIP | Política de entrada |
|---|---|---|
| **Backlog** | — | Qualquer ideia ou pedido do cliente. Ainda não precisa estar detalhado. |
| **Pronto para desenvolver** | — | História escrita, com critérios de aceitação, e ordenada por prioridade (o topo é o próximo a ser puxado). |
| **Em andamento** | **2** | Card puxado do topo de "Pronto para desenvolver". Branch criada. |
| **Revisão e testes** | **2** | Código commitado, testes automatizados escritos e passando. Falta revisar e validar os critérios de aceitação. |
| **Concluído** | — | Todos os critérios de aceitação atendidos, código na branch `main`, documentação atualizada. |

Uso limite 2 em "Em andamento" (e não 1) porque às vezes fico bloqueada esperando algo externo, como a resposta de uma dúvida ou uma decisão de design, e é útil poder adiantar outro card nesse meio-tempo. Com 3 ou mais, eu voltaria ao problema de ter muita coisa aberta.

## Priorização das 5 funcionalidades

A ordem abaixo é a da coluna "Pronto para desenvolver". Para priorizar, cruzei **valor para o usuário**, **esforço** e **dependências técnicas**. O sistema atual não tem cadastro de usuários (o `id_usuario` é sempre gravado como `1` em `modelo.js`), e isso pesa bastante na ordem.

| # | Funcionalidade | Valor | Esforço | Dependências | Justificativa |
|---|---|---|---|---|---|
| 1 | **Busca de perguntas por palavra-chave** | Alto | Baixo | Nenhuma | Resolve a dor mais imediata (encontrar uma pergunta numa lista que só cresce) e não depende de nada novo no banco. É a entrega mais rápida de valor. |
| 2 | **Categorização de perguntas (tags)** | Alto | Médio | Nenhuma | Organiza o conteúdo e potencializa a busca (buscar dentro de uma categoria). Exige uma tabela nova, mas não exige usuários. |
| 3 | **Votação em perguntas** | Alto | Médio | Identificação do usuário | Destaca perguntas relevantes. Para impedir voto duplicado, precisa saber *quem* votou. Proponho usar o `id_usuario` que já existe no esquema como identificação mínima, sem login completo. |
| 4 | **Perfil de usuário com histórico** | Médio | Alto | Cadastro de usuários | Exige criar a entidade `Usuario` de verdade e associá-la a perguntas **e** respostas (hoje a tabela `respostas` nem tem `id_usuario`). É a base que viabiliza a notificação. |
| 5 | **Notificação de novas respostas** | Médio | Alto | Perfil de usuário | Só faz sentido quando existe um dono identificado para cada pergunta. Depende diretamente da funcionalidade 4. |

Essa ordem também segue a lógica de reduzir risco cedo: as duas primeiras entregam valor sem mexer no modelo de usuários, e só depois enfrento a mudança estrutural maior.
