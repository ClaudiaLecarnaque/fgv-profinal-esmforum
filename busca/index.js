// Raiz de composição da busca: o ÚNICO lugar que conhece as classes
// concretas e decide como elas se conectam. Para acrescentar um critério
// novo, basta incluí-lo na lista abaixo.

const ServicoBusca = require('./servico_busca.js');
const RepositorioPerguntasSQLite = require('./repositorio_perguntas_sqlite.js');
const CriterioPalavraChave = require('./criterios/criterio_palavra_chave.js');
const CriterioSemResposta = require('./criterios/criterio_sem_resposta.js');
const { validarFiltros, ErroValidacao } = require('./validar_filtros.js');

function criarServicoBusca(bd) {
  return new ServicoBusca(
    new RepositorioPerguntasSQLite(bd),
    [new CriterioPalavraChave(), new CriterioSemResposta()]
  );
}

module.exports = { criarServicoBusca, validarFiltros, ErroValidacao };
