// Responsabilidade única: transformar um texto em uma forma canônica
// para comparação (RN02 do caso de uso): minúsculas, sem acentos e com
// espaços unificados. Não sabe nada de perguntas, busca ou banco de dados.

function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')                 // separa letras de acentos: "ç" -> "c" + "̧"
    .replace(/[̀-ͯ]/g, '')  // remove os acentos (marcas combinantes)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Separa um texto já normalizado em palavras, descartando vazios.
function separarPalavras(texto) {
  const normalizado = normalizarTexto(texto);
  return normalizado === '' ? [] : normalizado.split(' ');
}

module.exports = { normalizarTexto, separarPalavras };
