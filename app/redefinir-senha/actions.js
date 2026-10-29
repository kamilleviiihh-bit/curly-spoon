"use server";

import { createClient, hasSupabaseConfig } from "../../lib/supabase/server";
import { authErrorMessage } from "../../lib/supabase/errors";

export async function redefinirSenha(previousState, formData) {
  const password = String(formData.get("password") || "");
  const confirmacao = String(formData.get("confirmacao") || "");
  if (password.length < 6) return { error: "Use uma senha com pelo menos 6 caracteres." };
  if (password !== confirmacao) return { error: "As senhas não coincidem. Digite a mesma senha nos dois campos." };
  if (!hasSupabaseConfig()) return { error: "A recuperação de senha ainda não foi configurada." };
  try {
    const supabase = await createClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) return { error: "Sua sessão expirou. Solicite um novo link de recuperação." };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: authErrorMessage(error) };
    return { concluido: true };
  } catch (error) {
    return { error: authErrorMessage(error) };
  }
}
