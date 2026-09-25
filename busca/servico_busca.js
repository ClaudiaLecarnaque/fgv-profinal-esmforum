// Serviço de aplicação da busca. Sua única responsabilidade é orquestrar:
// obter as perguntas do repositório e manter as que atendem a todos os
// critérios ativos.
//
// - DIP: depende de abstrações (um repositório e uma lista de critérios)
//   recebidas pelo construtor. Não sabe que existe SQLite nem quais
//   critérios concretos existem.
// - OCP: um novo tipo de filtro é uma nova classe de critério. Esta classe
//   não precisa ser modificada.

class ServicoBusca {
  constructor(repositorio, criterios) {
    this.repositorio = repositorio;
    this.criterios = criterios;
  }

  buscar(filtros) {
    const ativos = this.criterios.filter(criterio => criterio.seAplica(filtros));
    return this.repositorio
      .listarComNumRespostas()
      .filter(pergunta => ativos.every(criterio => criterio.atende(pergunta, filtros)));
  }
}

module.exports = ServicoBusca;
