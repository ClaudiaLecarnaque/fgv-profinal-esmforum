const bd = require('../../bd/bd_utils.js');
const modelo = require('../../modelo.js');
const RepositorioPerguntas = require('../../busca/repositorio_perguntas.js');
const RepositorioPerguntasSQLite = require('../../busca/repositorio_perguntas_sqlite.js');

// Teste de integração: usa o banco de teste real do projeto.
beforeEach(() => {
  bd.reconfig('./bd/esmforum-teste.db');
  bd.exec('delete from perguntas', []);
  bd.exec('delete from respostas', []);
});

test('a abstração falha se o método não for implementado', () => {
  class RepositorioIncompleto extends RepositorioPerguntas {}
  expect(() => new RepositorioIncompleto().listarComNumRespostas())
    .toThrow('RepositorioIncompleto deve implementar listarComNumRespostas()');
});

test('lista perguntas com o número de respostas em uma única consulta', () => {
  const id1 = modelo.cadastrar_pergunta('Como usar git rebase?');
  const id2 = modelo.cadastrar_pergunta('O que é TDD?');
  modelo.cadastrar_resposta(id1, 'Use git rebase -i');
  modelo.cadastrar_resposta(id1, 'Leia a documentação');

  const espiao = jest.spyOn(bd, 'queryAll');
  const perguntas = new RepositorioPerguntasSQLite(bd).listarComNumRespostas();

  expect(espiao).toHaveBeenCalledTimes(1);
  espiao.mockRestore();
  expect(perguntas).toHaveLength(2);
  expect(perguntas[0]).toMatchObject({ id_pergunta: id1, num_respostas: 2 });
  expect(perguntas[1]).toMatchObject({ id_pergunta: id2, num_respostas: 0 });
});

test('retorna lista vazia quando não há perguntas', () => {
  expect(new RepositorioPerguntasSQLite(bd).listarComNumRespostas()).toEqual([]);
});
