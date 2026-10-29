import test from 'node:test';
import assert from 'node:assert/strict';
import { separarSecoes } from '../app/modelos-formatacao.js';

function reconstruir(resultado) {
  return [...resultado.cabecalho, ...resultado.secoes.flatMap(s => [s.titulo, ...s.linhas])].join('\n');
}

test('reconhece as seis seções sem alterar nenhuma linha do currículo', () => {
  const texto = '[Seu nome]\n[Cidade] · [telefone] · [e-mail]\n\nOBJETIVO\nAprendiz\n\nFORMAÇÃO\nEscola A\nCURSOS\nExcel básico\nEXPERIÊNCIAS\nAjuda na loja\nHARD SKILLS\nPlanilhas\nSOFT SKILLS\nOrganização';
  const resultado = separarSecoes(texto);
  assert.deepEqual(resultado.secoes.map(s => s.tipo), ['OBJETIVO', 'FORMAÇÃO', 'CURSOS', 'EXPERIÊNCIAS', 'HARD SKILLS', 'SOFT SKILLS']);
  assert.equal(reconstruir(resultado), texto);
});

test('preserva cabeçalhos com Markdown, texto na mesma linha, espaços e seções desconhecidas', () => {
  const texto = '  [Nome]  \n\n**FORMAÇÃO:** Escola Técnica\n2º ano\n\nCURSOS: Excel\n\nIDIOMAS\nPortuguês\nEXPERIÊNCIAS E ATIVIDADES\nCuido dos meus irmãos\n';
  const resultado = separarSecoes(texto);
  assert.equal(resultado.secoes.length, 3);
  assert.equal(resultado.secoes[0].titulo, '**FORMAÇÃO:** Escola Técnica');
  assert.equal(reconstruir(resultado), texto);
});

test('texto livre ou campos vazios não ganham informações nem seções inventadas', () => {
  for (const texto of ['', 'Uma linha sem títulos', '\n\n', 'Aprendi a usar planilhas\nAjudo em casa']) {
    const resultado = separarSecoes(texto);
    assert.equal(resultado.secoes.length, 0);
    assert.equal(reconstruir(resultado), texto);
  }
});
