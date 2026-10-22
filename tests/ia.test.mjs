import test from 'node:test';
import assert from 'node:assert/strict';
import { desafio } from '../desafio.js';
import { gerarResposta, montarPrompt, validarCampos } from '../lib/ia.js';

const campos = { escola: 'Ensino médio', cursos: '', atividades: 'Cuido dos meus irmãos', habilidades: '', objetivo: 'Jovem aprendiz' };
const config = { ...desafio, modoTeste: false };

test('modo de teste usa os campos e não faz requisições nem exige chave', async () => {
  const texto = await gerarResposta(campos, {
    config: { ...desafio, modoTeste: true }, apiKey: '',
    fetchImpl: () => { throw new Error('Não deveria acessar a rede'); },
  });
  assert.match(texto, /EXEMPLO DE TESTE/);
  assert.match(texto, /Ensino médio/);
  assert.match(texto, /Cuido dos meus irmãos/);
  assert.doesNotMatch(texto, /CURSOS\n|HABILIDADES\n/);
});

test('valida tipos, limite, campos em branco e permite seções vazias', () => {
  for (const entrada of [null, [], 'texto', {}, { escola: '  ' }, { escola: 123 }, { escola: 'a'.repeat(6001) }]) {
    assert.throws(() => validarCampos(entrada), (e) => e.status === 400);
  }
  assert.equal(validarCampos({ escola: ' Escola ' }).escola, 'Escola');
});

test('substitui todos os campos sem reinterpretar marcadores digitados pela pessoa', () => {
  const texto = montarPrompt({ ...campos, escola: 'Escola {objetivo} $&' });
  assert.match(texto, /ESCOLA: Escola \{objetivo\} \$&/);
  assert.match(texto, /CURSOS: \n/);
  assert.match(texto, /OBJETIVO: Jovem aprendiz/);
});

test('OpenRouter recebe endpoint, autorização, modelo, prompt e limite corretos', async () => {
  const texto = await gerarResposta(campos, {
    config, apiKey: 'chave-ficticia-de-teste',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Authorization, 'Bearer chave-ficticia-de-teste');
      assert.equal(options.cache, 'no-store');
      const body = JSON.parse(options.body);
      assert.equal(body.model, config.modelo);
      assert.equal(body.max_tokens, 900);
      assert.equal(body.stream, false);
      assert.deepEqual(body.reasoning, { effort: "none" });
      assert.equal(body.messages[0].content, montarPrompt(campos));
      assert.ok(options.signal instanceof AbortSignal);
      return Response.json({ choices: [{ message: { content: 'CURRÍCULO\nSegunda linha' } }] });
    },
  });
  assert.equal(texto, 'CURRÍCULO\nSegunda linha');
});

for (const [status, esperado, mensagem] of [
  [429, 429, 'Você atingiu o limite de uso de hoje.'],
  [401, 401, 'Chave da IA inválida.'],
  [500, 502, 'A inteligência artificial está indisponível no momento. Tente novamente mais tarde.'],
]) {
  test(`erro ${status} é traduzido sem expor o corpo do provedor`, async () => {
    await assert.rejects(gerarResposta(campos, {
      config, apiKey: 'teste', fetchImpl: async () => new Response('Sensitive upstream detail', { status }),
    }), (error) => error.status === esperado && error.message === mensagem);
  });
}

test('configuração ausente, falha de rede e timeout têm erros próprios', async () => {
  await assert.rejects(gerarResposta(campos, { config, apiKey: '' }), (e) => e.status === 503);
  await assert.rejects(gerarResposta(campos, {
    config, apiKey: 'teste', fetchImpl: async () => { throw new TypeError('fetch failed'); },
  }), /Não foi possível conectar/);
  await assert.rejects(gerarResposta(campos, {
    config, apiKey: 'teste', fetchImpl: async () => { throw new DOMException('Timeout', 'TimeoutError'); },
  }), (e) => e.status === 504);
});

test('resposta vazia, formato inválido ou JSON inválido não viram sucesso', async () => {
  for (const response of [Response.json({}), Response.json({ choices: [{ message: { content: ' ' } }] }), new Response('not json')]) {
    await assert.rejects(gerarResposta(campos, {
      config, apiKey: 'teste', fetchImpl: async () => response,
    }), /não retornou uma resposta válida/);
  }
});


test('aceita conteúdo em blocos de texto sem exibir raciocínio ou ferramentas', async () => {
  const texto = await gerarResposta(campos, {
    config, apiKey: 'teste', fetchImpl: async () => Response.json({ choices: [{
      finish_reason: 'stop', message: {
        reasoning: 'Conteúdo interno que não deve ser exibido',
        content: [
          { type: 'text', text: 'FORMAÇÃO\n' },
          { type: 'reasoning', text: 'Não mostrar' },
          { type: 'text', text: 'Ensino médio' },
        ],
      },
    }] }),
  });
  assert.equal(texto, 'FORMAÇÃO\nEnsino médio');
});

for (const [code, status, message] of [
  [401, 401, 'Chave da IA inválida.'],
  ['429', 429, 'Você atingiu o limite de uso de hoje.'],
  [402, 503, 'A conta da IA não tem saldo disponível. Verifique a conta na OpenRouter.'],
  [503, 502, 'O serviço de IA não conseguiu concluir o pedido. Tente novamente em instantes.'],
]) {
  test(`traduz erro ${code} mesmo com HTTP 200, sem expor detalhes do provedor`, async () => {
    for (const data of [{ error: { code, message: 'Segredo interno' } }, { choices: [{ error: { code } }] }]) {
      await assert.rejects(gerarResposta(campos, {
        config, apiKey: 'teste', fetchImpl: async () => Response.json(data),
      }), (e) => e.status === status && e.message === message);
    }
  });
}

test('não confunde raciocínio sem resposta final ou texto truncado com currículo pronto', async () => {
  for (const content of [null, 'Currículo cortado no meio']) {
    await assert.rejects(gerarResposta(campos, {
      config, apiKey: 'teste', fetchImpl: async () => Response.json({ choices: [{
        finish_reason: 'length', message: { content, reasoning: 'Internal only' },
      }] }),
    }), /atingiu o limite antes de concluir/);
  }
});

test('recusa e erro de geração não viram sucesso, mesmo com texto parcial', async () => {
  for (const finish_reason of ['content_filter', 'error']) {
    await assert.rejects(gerarResposta(campos, {
      config, apiKey: 'teste', fetchImpl: async () => Response.json({ choices: [{
        finish_reason, message: { content: 'Texto parcial' },
      }] }),
    }), (e) => e.status === 502);
  }
});
