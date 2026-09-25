// Abstração (DIP): define O QUE a busca precisa do armazenamento de
// perguntas, sem dizer COMO os dados são obtidos. O ServicoBusca depende
// só deste contrato; SQLite, memória ou uma API externa podem implementá-lo.
//
// JavaScript não tem interfaces, então usamos uma classe base cujo método
// falha se não for sobrescrito. Isso documenta o contrato e faz a
// implementação incompleta falhar cedo, com uma mensagem clara.

class RepositorioPerguntas {
  /**
   * @returns {Array<{id_pergunta: number, texto: string, id_usuario: number, num_respostas: number}>}
   */
  listarComNumRespostas() {
    throw new Error(`${this.constructor.name} deve implementar listarComNumRespostas()`);
  }
}

module.exports = RepositorioPerguntas;
