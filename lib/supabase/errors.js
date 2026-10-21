import { isAuthError } from "@supabase/supabase-js";

export function authErrorMessage(error) {
  if (!isAuthError(error)) return "Não foi possível conectar. Tente novamente em instantes.";
  const messages = {
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
  return messages[error.code] || "Não foi possível concluir a autenticação. Tente novamente em instantes.";
}
