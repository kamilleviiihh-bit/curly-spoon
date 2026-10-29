// Recognize only explicit section headings. Keep every original line unchanged.
export function separarSecoes(texto) {
  const cabecalho = [];
  const secoes = [];
  let atual = null;
  for (const linha of texto.split("\n")) {
    const identificador = linha.trim().replaceAll("**", "");
    const match = identificador.match(/^(OBJETIVO|FORMAÇÃO|CURSOS|EXPERIÊNCIAS(?: E ATIVIDADES)?|HARD SKILLS|SOFT SKILLS|HABILIDADES)(?::.*)?$/iu);
    if (match) {
      atual = { tipo: match[1].toUpperCase(), titulo: linha, linhas: [] };
      secoes.push(atual);
    } else if (atual) {
      atual.linhas.push(linha);
    } else {
      cabecalho.push(linha);
    }
  }
  return { cabecalho, secoes };
}
