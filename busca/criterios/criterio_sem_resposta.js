// Critério de busca: somente perguntas ainda sem respostas (FA4 do caso de uso).
//
// Este critério foi acrescentado DEPOIS do ServicoBusca estar pronto, sem
// alterar uma linha dele: basta seguir o mesmo contrato e registrá-lo na
// composição (busca/index.js). É o Princípio Aberto/Fechado na prática.

class CriterioSemResposta {
  seAplica(filtros) {
    return filtros.sem_resposta === true;
  }

  atende(pergunta) {
    return pergunta.num_respostas === 0;
  }
}

module.exports = CriterioSemResposta;
