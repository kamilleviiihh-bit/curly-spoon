import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { authErrorMessage } from '../lib/supabase/errors.js';

const unavailable = 'O serviço de login está indisponível no momento. Tente novamente em instantes.';
test('erro de credenciais não é confundido com serviço indisponível', () => {
  assert.equal(authErrorMessage(new AuthApiError('Invalid credentials', 400, 'invalid_credentials')), 'E-mail ou senha incorretos.');
});
test('erros do serviço são traduzidos mesmo sem código retornado', () => {
  assert.equal(authErrorMessage(new AuthApiError('Internal server error', 500)), unavailable);
  assert.equal(authErrorMessage(new AuthRetryableFetchError('Service unavailable', 503)), unavailable);
});
test('limite, timeout e provedor desabilitado têm instruções específicas', () => {
  assert.match(authErrorMessage(new AuthApiError('Too many requests', 429)), /Muitas tentativas/);
  assert.match(authErrorMessage(new AuthApiError('Timeout', 504, 'request_timeout')), /demorou para responder/);
  assert.match(authErrorMessage(new AuthApiError('Disabled', 400, 'email_provider_disabled')), /acesso por e-mail está desativado/);
});
test('falha de rede não aparece como senha incorreta', () => {
  assert.match(authErrorMessage(new AuthRetryableFetchError('fetch failed', 0)), /conectar ao serviço de login/);
});
test('diagnóstico registra somente status e código, sem mensagem nem dados da requisição', (t) => {
  const logs = [];
  t.mock.method(console, 'warn', (...args) => logs.push(args));
  const error = new AuthApiError('Sensitive message with password/token', 500, 'unexpected_failure');
  error.request = { password: 'password-must-not-be-logged', token: 'token-must-not-be-logged' };
  assert.equal(authErrorMessage(error), unavailable);
  assert.deepEqual(logs, [['Falha de autenticação no Supabase', { status: 500, codigo: 'unexpected_failure' }]]);
});
test('erro desconhecido não é mostrado nem registrado integralmente', (t) => {
  const logs = [];
  t.mock.method(console, 'warn', (...args) => logs.push(args));
  assert.match(authErrorMessage(new TypeError('sensitive transport information')), /conectar ao serviço de login/);
  assert.deepEqual(logs[0][1], { status: null, codigo: 'nao_informado' });
});
