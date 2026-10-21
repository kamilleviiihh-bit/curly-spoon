"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfig } from "../../lib/supabase/server";
import { authErrorMessage } from "../../lib/supabase/errors";

export async function autenticar(previousState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const intent = formData.get("intent");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Informe um e-mail válido." };
  if (!password) return { error: "Informe sua senha." };
  if (intent !== "login" && intent !== "signup") return { error: "Selecione Entrar ou Criar conta." };
  if (intent === "signup" && password.length < 6) return { error: "Use uma senha com pelo menos 6 caracteres." };
  if (!hasSupabaseConfig()) return { error: "O login ainda não foi configurado. Entre em contato com a responsável pelo site." };
  try {
    const supabase = await createClient();
    if (intent === "signup") {
      const origin = (await headers()).get("origin");
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: origin ? { emailRedirectTo: `${origin}/auth/callback` } : {},
      });
      if (error) return { error: authErrorMessage(error) };
      if (!data.session) return { message: "Se o cadastro puder ser concluído, você receberá um e-mail. Confira sua caixa de entrada para confirmar a conta." };
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: authErrorMessage(error) };
    }
  } catch (error) {
    return { error: authErrorMessage(error) };
  }
  redirect("/");
}

export async function sair() {
  if (!hasSupabaseConfig()) redirect("/login");
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { error: "Não foi possível sair. Tente novamente." };
  } catch {
    return { error: "Não foi possível sair. Verifique sua conexão e tente novamente." };
  }
  redirect("/login");
}
