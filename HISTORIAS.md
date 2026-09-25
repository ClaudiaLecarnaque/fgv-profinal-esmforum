# Histórias de Usuário

Das cinco funcionalidades pedidas pelo cliente, escolhi as três primeiras da ordem de prioridade definida no board ([PROCESSO.md](PROCESSO.md)): **busca**, **categorização** e **votação**. Elas formam um conjunto coerente, porque as três tratam de *encontrar e destacar* conteúdo no fórum. As duas restantes (perfil e notificação) dependem de introduzir um cadastro completo de usuários, o que é uma mudança estrutural maior e ficará para um próximo ciclo.

---

## História 1: Busca de perguntas por palavra-chave

**Como** visitante do fórum,
**Eu quero** buscar perguntas digitando uma ou mais palavras-chave,
**Para** encontrar rapidamente se minha dúvida já foi feita (e respondida), sem precisar ler a lista inteira.

**Critérios de Aceitação:**
- [ ] A página de perguntas exibe um campo de busca acima da lista, com um botão "Buscar" que também é acionado pela tecla Enter.
- [ ] A busca retorna somente as perguntas cujo texto contém **todas** as palavras digitadas, sem diferenciar maiúsculas de minúsculas nem letras acentuadas de não acentuadas (buscar "funcao" encontra "Função").
- [ ] Um termo com menos de 2 caracteres (desconsiderando espaços) não é enviado e o sistema exibe o aviso "Digite pelo menos 2 caracteres".
- [ ] Quando nenhuma pergunta corresponde ao termo, o sistema exibe "Nenhuma pergunta encontrada para '<termo>'", em vez de uma tabela vazia.
- [ ] Um botão "Limpar" apaga o termo e volta a exibir a lista completa. Os resultados mantêm o número de respostas e o link para a página de respostas.

---

## História 2: Categorização de perguntas por tags

**Como** usuário que faz uma pergunta,
**Eu quero** classificar minha pergunta com uma ou mais categorias (tags) como *tecnologia*, *carreira* ou *dúvidas-gerais*,
**Para** que ela chegue às pessoas interessadas naquele assunto e para que eu mesmo consiga navegar pelo fórum por tema.

**Critérios de Aceitação:**
- [ ] O formulário de nova pergunta permite escolher de 1 a 3 tags de uma lista predefinida (*tecnologia*, *carreira*, *dúvidas-gerais*, *processos*, *testes*).
- [ ] Se o usuário não escolher nenhuma tag, a pergunta é salva automaticamente com a tag *dúvidas-gerais*.
- [ ] Cada pergunta da lista exibe suas tags como etiquetas (*badges*) ao lado do texto.
- [ ] Clicar em uma tag filtra a lista, mostrando só as perguntas daquela categoria, e o filtro ativo fica visível e pode ser removido.
- [ ] O filtro por tag pode ser combinado com a busca por palavra-chave (ex.: "deploy" dentro de *tecnologia*).

---

## História 3: Votação em perguntas

**Como** usuário identificado do fórum,
**Eu quero** votar a favor (upvote) ou contra (downvote) uma pergunta,
**Para** ajudar a comunidade a destacar as perguntas mais úteis e relevantes.

**Critérios de Aceitação:**
- [ ] Cada pergunta exibe botões de upvote (▲) e downvote (▼) e a sua pontuação (total de upvotes menos total de downvotes).
- [ ] Cada usuário tem no máximo um voto por pergunta. Clicar de novo no mesmo botão **remove** o voto e clicar no botão oposto **troca** o voto.
- [ ] A pontuação é atualizada na tela logo após o clique, sem recarregar a página, e o botão do voto atual do usuário aparece destacado.
- [ ] A lista de perguntas pode ser ordenada por "Mais votadas".
- [ ] Usuários não identificados veem a pontuação, mas os botões ficam desabilitados, com a dica "Identifique-se para votar".

> **Nota técnica:** hoje o sistema não tem login, e o `id_usuario` é sempre `1`. Para esta história, proponho uma identificação mínima (o frontend envia o `id_usuario` junto com o voto), o que já basta para a regra de "um voto por usuário" no banco. A autenticação de verdade chega com a história de Perfil de Usuário.

---

## Priorização

| Prioridade | História | Valor | Esforço | Risco técnico |
|---|---|---|---|---|
| **1** | Busca por palavra-chave | Alto | Baixo | Baixo |
| **2** | Categorização por tags | Alto | Médio | Baixo |
| **3** | Votação em perguntas | Alto | Médio | Médio |

Fazendo o papel do Product Owner, a pergunta que usei para ordenar foi: **qual entrega gera mais valor para a comunidade, mais cedo, com menos risco?**

**1º Busca.** Um fórum de perguntas e respostas só é útil se o conteúdo antigo puder ser reencontrado. Sem busca, as pessoas repetem perguntas que já têm resposta, e isso piora o fórum para todos. É também a história mais barata: não exige nenhuma tabela nova, só uma consulta sobre o texto que já existe. Por ser a menor, é uma boa primeira entrega para validar o processo de ponta a ponta (história → código → testes → deploy).

**2º Categorização.** Aumenta o valor da busca (filtrar por tema) e organiza o conteúdo desde a criação da pergunta. Vem depois da busca porque exige mudar o esquema do banco (tabela `tags` e tabela de associação) e o formulário de nova pergunta, mas ainda não depende de usuários. Há também um motivo de ordem prática: quanto antes as tags existirem, menos perguntas "antigas" ficam sem categoria.

**3º Votação.** Tem valor alto, mas é a única das três que precisa saber **quem** está agindo, para garantir um voto por pessoa. Isso a coloca mais perto das mudanças estruturais de usuário e aumenta o risco. Além disso, a votação rende mais quando já existe volume de conteúdo e formas de navegar por ele, que é exatamente o que as duas primeiras histórias entregam.
