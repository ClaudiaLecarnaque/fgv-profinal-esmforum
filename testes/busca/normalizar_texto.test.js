const { normalizarTexto, separarPalavras } = require('../../busca/normalizar_texto.js');

describe('normalizarTexto', () => {
  test('converte para minúsculas', () => {
    expect(normalizarTexto('JavaScript')).toBe('javascript');
  });

  test('remove acentos e cedilha', () => {
    expect(normalizarTexto('Função Ação Índice Pôr')).toBe('funcao acao indice por');
  });

  test('unifica espaços e remove espaços nas extremidades', () => {
    expect(normalizarTexto('  como   usar\n git  ')).toBe('como usar git');
  });

  test('trata null e undefined como texto vazio', () => {
    expect(normalizarTexto(null)).toBe('');
    expect(normalizarTexto(undefined)).toBe('');
  });
});

describe('separarPalavras', () => {
  test('separa o texto normalizado em palavras', () => {
    expect(separarPalavras('  Função   JavaScript ')).toEqual(['funcao', 'javascript']);
  });

  test('retorna lista vazia para texto em branco', () => {
    expect(separarPalavras('   ')).toEqual([]);
  });
});
