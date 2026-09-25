const request = require('supertest');
const bd = require('../../bd/bd_utils.js');
const modelo = require('../../modelo.js');
const app = require('../../server.js');

// Teste de ponta a ponta da API (HTTP -> serviço -> banco de teste).
beforeEach(() => {
  bd.reconfig('./bd/esmforum-teste.db');
  bd.exec('delete from perguntas', []);
  bd.exec('delete from respostas', []);
  const id = modelo.cadastrar_pergunta('Como usar Git rebase?');
  modelo.cadastrar_resposta(id, 'Use git rebase -i');
  modelo.cadastrar_pergunta('Git merge ou rebase? Qual a diferença?');
  modelo.cadastrar_pergunta('O que é TDD?');
});

test('GET /perguntas/busca retorna as perguntas encontradas', async () => {
  const res = await request(app).get('/perguntas/busca').query({ q: 'REBASE' });
  expect(res.status).toBe(200);
  expect(res.body.termo).toBe('REBASE');
  expect(res.body.total).toBe(2);
  expect(res.body.perguntas[0]).toMatchObject({ texto: 'Como usar Git rebase?', num_respostas: 1 });
});

test('ignora acentos no termo e no texto', async () => {
  const res = await request(app).get('/perguntas/busca').query({ q: 'diferenca' });
  expect(res.body.total).toBe(1);
});

test('combina palavra-chave com sem_resposta=true', async () => {
  const res = await request(app).get('/perguntas/busca').query({ q: 'rebase', sem_resposta: 'true' });
  expect(res.body.perguntas.map(p => p.texto)).toEqual(['Git merge ou rebase? Qual a diferença?']);
});

test('retorna total 0 quando nada corresponde', async () => {
  const res = await request(app).get('/perguntas/busca').query({ q: 'kubernetes' });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ termo: 'kubernetes', total: 0, perguntas: [] });
});

test('responde 400 para termo inválido', async () => {
  const res = await request(app).get('/perguntas/busca').query({ q: 'a' });
  expect(res.status).toBe(400);
  expect(res.body.erro).toMatch(/pelo menos 2 caracteres/);
});

test('rotas existentes continuam funcionando', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(3);
});
