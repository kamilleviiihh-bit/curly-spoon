import { isAuthError } from "@supabase/supabase-js";

export function authErrorMessage(error) {
  const status = Number.isInteger(error?.status) && error.status >= 0 && error.status <= 599 ? error.status : null;
  const codigo = typeof error?.code === "string" && /^[a-z_]{1,64}$/.test(error.code) ? error.code : "nao_informado";
  // Do not log the original error: it may contain request details or credentials.
  console.warn("Falha de autenticação no Supabase", { status, codigo });
  if (!isAuthError(error)) return "Não foi possível conectar ao serviço de login. Tente novamente em instantes.";
  const messages = {
    invalid_api_key: "A configuração do login está inválida. Entre em contato com a responsável pelo site.",
    request_timeout: "O serviço de login demorou para responder. Tente novamente em instantes.",
    unexpected_failure: "O serviço de login está indisponível no momento. Tente novamente em instantes.",
    email_provider_disabled: "O acesso por e-mail está desativado. Entre em contato com a responsável pelo site.",
    captcha_failed: "Não foi possível validar a verificação de segurança. Tente novamente.",
    invalid_credentials: "E-mail ou senha incorretos.",
    email_not_confirmed: "Confirme seu e-mail antes de entrar.",
    user_already_exists: "Já existe uma conta com este e-mail.",
    email_exists: "Já existe uma conta com este e-mail.",
    weak_password: "A senha não atende aos requisitos de segurança. Use uma senha mais forte.",
    same_password: "Escolha uma senha diferente da anterior.",
    signup_disabled: "A criação de contas está desativada no momento.",
    email_address_invalid: "Informe um e-mail válido.",
    email_address_not_authorized: "Não foi possível enviar a confirmação para este e-mail.",
    over_email_send_rate_limit: "Aguarde alguns minutos antes de solicitar outro e-mail.",
    over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    user_banned: "Esta conta está temporariamente indisponível.",
  };
  if (messages[error.code]) return messages[error.code];
  if (status === 429) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (status >= 500) return "O serviço de login está indisponível no momento. Tente novamente em instantes.";
  if (status === 0) return "Não foi possível conectar ao serviço de login. Tente novamente em instantes.";
  return "Não foi possível concluir a autenticação. Tente novamente em instantes.";
}
