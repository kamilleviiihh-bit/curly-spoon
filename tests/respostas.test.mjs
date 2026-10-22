import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { desafio } from '../desafio.js';
import { formatarEntrada, salvarResposta, carregarHistorico } from '../lib/respostas.js';

const entrada = { escola: 'Escola A', cursos: 'Excel', experiencias: 'Ajuda na padaria', objetivo: 'Aprendiz', hard_skills: 'Planilhas', soft_skills: 'Organização' };
function cliente(fetch) {
  return createClient('https://supabase.example', 'public-key-test', {
    accessToken: async () => 'sessao-da-usuaria',
    global: { fetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

test('entrada salva contém todos os rótulos e valores na ordem do formulário', () => {
  const texto = formatarEntrada({ ...entrada, user_id: 'outra-pessoa' });
  assert.equal(texto, desafio.campos.map(({ id, rotulo }) => `${rotulo}:\n${entrada[id]}`).join('\n\n'));
  assert.doesNotMatch(texto, /user_id|outra-pessoa/);
});

test('insert usa a sessão e envia somente entrada e resposta, sem definir a proprietária', async () => {
  let chamadas = 0;
  const supabase = cliente(async (url, options) => {
    chamadas++;
    assert.equal(new URL(url).pathname, '/rest/v1/respostas');
    assert.equal(options.method, 'POST');
    assert.equal(new Headers(options.headers).get('Authorization'), 'Bearer sessao-da-usuaria');
    assert.deepEqual(JSON.parse(options.body), { entrada: formatarEntrada(entrada), resposta: 'CURRÍCULO\nLinha 2' });
    return new Response(null, { status: 201 });
  });
  await salvarResposta(supabase, { ...entrada, user_id: 'forjado' }, 'CURRÍCULO\nLinha 2');
  assert.equal(chamadas, 1);
});

test('falha de gravação é comunicada sem expor detalhes do banco', async () => {
  const supabase = cliente(async () => Response.json({ message: 'Sensitive database detail', code: '42501' }, { status: 403 }));
  await assert.rejects(salvarResposta(supabase, entrada, 'Texto'), { message: 'Não foi possível salvar no histórico.' });
});

test('consulta filtra a conta validada, ordena por data decrescente e pagina', async () => {
  const supabase = cliente(async (url, options) => {
    const params = new URL(url).searchParams;
    assert.equal(new Headers(options.headers).get('Authorization'), 'Bearer sessao-da-usuaria');
    assert.equal(params.get('user_id'), 'eq.conta-A');
    assert.equal(params.get('order'), 'criado_em.desc,id.desc');
    assert.equal(params.get('offset'), '20');
    assert.equal(params.get('limit'), '20');
    assert.equal(params.get('select'), 'id,entrada,resposta,criado_em');
    assert.match(new Headers(options.headers).get('Prefer'), /count=exact/);
    return Response.json([{ id: 'resposta-A', resposta: 'Texto' }], { headers: { 'Content-Range': '20-20/21' } });
  });
  const result = await carregarHistorico(supabase, 'conta-A', 2);
  assert.equal(result.error, null);
  assert.equal(result.count, 21);
  assert.equal(result.data[0].id, 'resposta-A');
});
