# Caso de Uso: Buscar Perguntas por Palavra-Chave

Detalha a **História 1** de [HISTORIAS.md](HISTORIAS.md). Escolhi esta história porque ela foi a implementada na Parte 3 (ver [IMPLEMENTACAO_SOLID.md](IMPLEMENTACAO_SOLID.md)). Assim, este caso de uso, o [diagrama de sequência](diagramas/diagrama_sequencia.png) e o código descrevem o mesmo comportamento.

---

## Caso de Uso UC01: Buscar Perguntas por Palavra-Chave

**Ator principal:** Visitante do fórum (qualquer pessoa usando o sistema; não é preciso estar identificado).

**Atores secundários:** nenhum. O sistema consulta apenas o próprio banco de dados.

**Objetivo:** encontrar perguntas já cadastradas cujo texto contenha as palavras de interesse.

**Pré-condições:**
- O backend (API) e o frontend estão em execução.
- O visitante está na página principal (lista de perguntas).

**Gatilho:** o visitante digita um termo no campo de busca e aciona "Buscar" (botão ou tecla Enter).

### Fluxo Principal

1. O sistema exibe a lista de perguntas com o campo de busca acima dela.
2. O visitante digita uma ou mais palavras-chave no campo de busca (ex.: `função javascript`).
3. O visitante aciona "Buscar".
4. O frontend verifica se o termo tem pelo menos 2 caracteres, desconsiderando espaços.
5. O frontend envia a requisição `GET /perguntas/busca?q=<termo>` para a API.
6. A API valida o termo (obrigatório, entre 2 e 100 caracteres).
7. O sistema recupera as perguntas do banco de dados, cada uma com o seu número de respostas.
8. O sistema normaliza o termo e o texto de cada pergunta (minúsculas, sem acentos, espaços unificados) e separa o termo em palavras.
9. O sistema seleciona as perguntas cujo texto contém **todas** as palavras do termo.
10. A API responde com o termo pesquisado, a quantidade de resultados e a lista de perguntas encontradas.
11. O frontend substitui a lista exibida pelos resultados e mostra "N pergunta(s) encontrada(s) para '<termo>'".
12. O caso de uso termina.

### Fluxos Alternativos

**FA1: Termo curto demais no frontend (passo 4)**
- 4a. O frontend detecta que o termo tem menos de 2 caracteres.
- 4b. O frontend exibe o aviso "Digite pelo menos 2 caracteres" e não envia a requisição.
- 4c. Retorna ao passo 2.

**FA2: Nenhuma pergunta encontrada (passo 9)**
- 9a. Nenhuma pergunta contém todas as palavras do termo.
- 9b. A API responde com `total: 0` e lista vazia.
- 9c. O frontend exibe "Nenhuma pergunta encontrada para '<termo>'" no lugar da tabela.
- 9d. O caso de uso termina.

**FA3: Visitante limpa a busca (a qualquer momento após o passo 11)**
- a. O visitante aciona "Limpar".
- b. O frontend apaga o termo, solicita a lista completa (`GET /`) e volta a exibir todas as perguntas.
- c. Retorna ao passo 1.

**FA4: Buscar apenas perguntas sem resposta (passo 2)**
- 2a. Além do termo, o visitante marca a opção "Só sem resposta".
- 2b. O frontend inclui `sem_resposta=true` na requisição do passo 5.
- 2c. No passo 9, o sistema também exclui as perguntas que já têm respostas.
- 2d. Segue no passo 10.

### Fluxos de Exceção

**FE1: Termo inválido recebido pela API (passo 6)**
- 6a. A requisição chega à API sem termo, ou com termo menor que 2 ou maior que 100 caracteres (por exemplo, uma chamada feita diretamente, sem passar pelo frontend).
- 6b. A API responde com status **400** e uma mensagem explicando o problema.
- 6c. O frontend exibe a mensagem ao visitante. O caso de uso termina.

**FE2: Falha de comunicação ou erro interno (passos 5 a 10)**
- a. A API está fora do ar ou ocorre um erro ao consultar o banco (status **500**).
- b. O frontend exibe "Não foi possível realizar a busca. Tente novamente." e mantém a lista que estava na tela.
- c. O caso de uso termina.

### Pós-condições

- **Sucesso:** a tela exibe apenas as perguntas que correspondem ao termo (ou a mensagem de "nenhuma encontrada"), cada uma com seu número de respostas e link para a página de respostas.
- **Em qualquer caso:** o banco de dados **não é alterado**. A busca é uma operação somente de leitura, o que a torna segura para repetir quantas vezes o visitante quiser.

### Regras de Negócio

| Código | Regra |
|---|---|
| RN01 | O termo de busca deve ter entre 2 e 100 caracteres, desconsiderando espaços nas extremidades. |
| RN02 | A comparação ignora maiúsculas/minúsculas e acentos. |
| RN03 | Com mais de uma palavra, a pergunta precisa conter **todas** elas (operação "E"), em qualquer ordem. |
| RN04 | Os resultados seguem a mesma ordem da lista principal (ordem de cadastro). |
