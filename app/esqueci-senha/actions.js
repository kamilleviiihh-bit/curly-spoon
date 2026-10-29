"use server";

import { headers } from "next/headers";
import { createClient, hasSupabaseConfig } from "../../lib/supabase/server";
import { authErrorMessage } from "../../lib/supabase/errors";

export async function solicitarRecuperacao(previousState, formData) {
  const email = String(formData.get("email") || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Informe um e-mail válido." };
  if (!hasSupabaseConfig()) return { error: "A recuperação de senha ainda não foi configurada. Entre em contato com a responsável pelo site." };
  try {
    const origin = (await headers()).get("origin");
    if (!origin) return { error: "Não foi possível identificar o endereço do site. Atualize a página e tente novamente." };
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/auth/callback?fluxo=recuperacao", origin).toString(),
    });
    // Never disclose whether the supplied address has an account.
    if (error && error.code !== "user_not_found") return { error: authErrorMessage(error) };
    return { message: "Se existir uma conta com esse e-mail, você receberá um link para redefinir a senha. Confira também a pasta de spam e abra o link neste mesmo navegador." };
  } catch (error) {
    return { error: authErrorMessage(error) };
  }
}
