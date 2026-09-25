const { validarFiltros, ErroValidacao } = require('../../busca/validar_filtros.js');

test('aceita termo válido e remove espaços das extremidades', () => {
  expect(validarFiltros({ q: '  git  ' })).toEqual({ q: 'git', sem_resposta: false });
});

test('converte sem_resposta=true em booleano', () => {
  expect(validarFiltros({ q: 'git', sem_resposta: 'true' }).sem_resposta).toBe(true);
  expect(validarFiltros({ q: 'git', sem_resposta: 'abc' }).sem_resposta).toBe(false);
});

test.each([
  ['ausente', {}],
  ['vazio', { q: '' }],
  ['só espaços', { q: '    ' }],
  ['com 1 caractere', { q: ' a ' }],
  ['com mais de 100 caracteres', { q: 'x'.repeat(101) }],
  ['que não é texto (q repetido na URL vira array)', { q: ['git', 'tdd'] }],
])('rejeita termo %s', (_, query) => {
  expect(() => validarFiltros(query)).toThrow(ErroValidacao);
});
