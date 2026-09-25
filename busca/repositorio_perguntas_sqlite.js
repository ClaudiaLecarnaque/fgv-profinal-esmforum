const RepositorioPerguntas = require('./repositorio_perguntas.js');

// Implementação concreta do repositório usando o SQLite do projeto.
// Recebe o módulo de acesso ao banco pelo construtor (injeção de
// dependência): em produção é o bd_utils; nos testes, o banco de teste.

class RepositorioPerguntasSQLite extends RepositorioPerguntas {
  constructor(bd) {
    super();
    this.bd = bd;
  }

  // Uma única consulta traz as perguntas já com o número de respostas,
  // evitando o padrão N+1 de modelo.listar_perguntas().
  listarComNumRespostas() {
    return this.bd.queryAll(`
      SELECT p.id_pergunta, p.texto, p.id_usuario,
             COUNT(r.id_resposta) AS num_respostas
        FROM perguntas p
        LEFT JOIN respostas r ON r.id_pergunta = p.id_pergunta
       GROUP BY p.id_pergunta
       ORDER BY p.id_pergunta`, []);
  }
}

module.exports = RepositorioPerguntasSQLite;
