// Responsabilidade única: transformar a query string da requisição HTTP em
// filtros válidos para o ServicoBusca, ou rejeitá-la (RN01 do caso de uso).
// Fica separado do serviço para que a regra HTTP (strings, status 400)
// não contamine a lógica de busca.

const TAMANHO_MINIMO = 2;
const TAMANHO_MAXIMO = 100;

class ErroValidacao extends Error {}

function validarFiltros(query) {
  const q = typeof query.q === 'string' ? query.q.trim() : '';

  if (q.length < TAMANHO_MINIMO) {
    throw new ErroValidacao(`O termo de busca deve ter pelo menos ${TAMANHO_MINIMO} caracteres.`);
  }
  if (q.length > TAMANHO_MAXIMO) {
    throw new ErroValidacao(`O termo de busca deve ter no máximo ${TAMANHO_MAXIMO} caracteres.`);
  }

  return { q, sem_resposta: query.sem_resposta === 'true' };
}

module.exports = { validarFiltros, ErroValidacao, TAMANHO_MINIMO, TAMANHO_MAXIMO };
