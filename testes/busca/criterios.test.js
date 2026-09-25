const CriterioPalavraChave = require('../../busca/criterios/criterio_palavra_chave.js');
const CriterioSemResposta = require('../../busca/criterios/criterio_sem_resposta.js');

describe('CriterioPalavraChave', () => {
  const criterio = new CriterioPalavraChave();
  const pergunta = { texto: 'Como declarar uma Função em JavaScript?' };

  test('se aplica somente quando há termo', () => {
    expect(criterio.seAplica({ q: 'git' })).toBe(true);
    expect(criterio.seAplica({ q: '   ' })).toBe(false);
    expect(criterio.seAplica({})).toBe(false);
  });

  test('ignora maiúsculas e acentos', () => {
    expect(criterio.atende(pergunta, { q: 'FUNCAO' })).toBe(true);
    expect(criterio.atende(pergunta, { q: 'função' })).toBe(true);
  });

  test('exige todas as palavras, em qualquer ordem', () => {
    expect(criterio.atende(pergunta, { q: 'javascript funcao' })).toBe(true);
    expect(criterio.atende(pergunta, { q: 'javascript python' })).toBe(false);
  });

  test('encontra palavras parciais', () => {
    expect(criterio.atende(pergunta, { q: 'declar' })).toBe(true);
  });
});

describe('CriterioSemResposta', () => {
  const criterio = new CriterioSemResposta();

  test('se aplica somente quando o filtro está ligado', () => {
    expect(criterio.seAplica({ sem_resposta: true })).toBe(true);
    expect(criterio.seAplica({ sem_resposta: false })).toBe(false);
    expect(criterio.seAplica({})).toBe(false);
  });

  test('aceita só perguntas sem respostas', () => {
    expect(criterio.atende({ num_respostas: 0 })).toBe(true);
    expect(criterio.atende({ num_respostas: 3 })).toBe(false);
  });
});
