const { normalizarTexto, separarPalavras } = require('../normalizar_texto.js');

// Critério de busca: a pergunta deve conter TODAS as palavras do termo
// (RN03), ignorando maiúsculas e acentos (RN02).
//
// Todo critério segue o mesmo contrato, usado pelo ServicoBusca:
//   seAplica(filtros)          -> este critério deve ser usado nesta busca?
//   atende(pergunta, filtros)  -> a pergunta passa neste critério?

class CriterioPalavraChave {
  seAplica(filtros) {
    return separarPalavras(filtros.q).length > 0;
  }

  atende(pergunta, filtros) {
    const texto = normalizarTexto(pergunta.texto);
    return separarPalavras(filtros.q).every(palavra => texto.includes(palavra));
  }
}

module.exports = CriterioPalavraChave;
