const ServicoBusca = require('../../busca/servico_busca.js');
const CriterioPalavraChave = require('../../busca/criterios/criterio_palavra_chave.js');
const CriterioSemResposta = require('../../busca/criterios/criterio_sem_resposta.js');

// Graças ao DIP, o serviço é testado com um repositório em memória:
// nenhum banco de dados é necessário neste teste.
class RepositorioEmMemoria {
  constructor(perguntas) { this.perguntas = perguntas; }
  listarComNumRespostas() { return this.perguntas; }
}

const perguntas = [
  { id_pergunta: 1, texto: 'Como usar git rebase?', num_respostas: 2 },
  { id_pergunta: 2, texto: 'Git merge ou rebase?', num_respostas: 0 },
  { id_pergunta: 3, texto: 'O que é TDD?', num_respostas: 1 },
];

function criarServico(criterios) {
  return new ServicoBusca(new RepositorioEmMemoria(perguntas), criterios);
}

test('filtra por palavra-chave', () => {
  const servico = criarServico([new CriterioPalavraChave()]);
  expect(servico.buscar({ q: 'rebase' }).map(p => p.id_pergunta)).toEqual([1, 2]);
});

test('combina critérios ativos (palavra-chave E sem resposta)', () => {
  const servico = criarServico([new CriterioPalavraChave(), new CriterioSemResposta()]);
  expect(servico.buscar({ q: 'rebase', sem_resposta: true }).map(p => p.id_pergunta)).toEqual([2]);
});

test('ignora critérios que não se aplicam aos filtros', () => {
  const servico = criarServico([new CriterioPalavraChave(), new CriterioSemResposta()]);
  expect(servico.buscar({ q: 'rebase', sem_resposta: false })).toHaveLength(2);
});

test('retorna lista vazia quando nada corresponde', () => {
  const servico = criarServico([new CriterioPalavraChave()]);
  expect(servico.buscar({ q: 'kubernetes' })).toEqual([]);
});

test('OCP: aceita um critério novo sem modificar o serviço', () => {
  // Um critério inventado só para o teste, com o mesmo contrato.
  const criterioIdPar = {
    seAplica: filtros => filtros.somente_pares === true,
    atende: pergunta => pergunta.id_pergunta % 2 === 0,
  };
  const servico = criarServico([new CriterioPalavraChave(), criterioIdPar]);
  expect(servico.buscar({ q: 'rebase', somente_pares: true }).map(p => p.id_pergunta)).toEqual([2]);
});
