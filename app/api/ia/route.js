import { createClient, hasSupabaseConfig } from "../../../lib/supabase/server";
import { ErroIA, gerarResposta } from "../../../lib/ia";

export const runtime = "nodejs";
export const maxDuration = 60;

function erro(mensagem, status) {
  return Response.json({ erro: mensagem }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  if (!hasSupabaseConfig()) return erro("O acesso ao site ainda não foi configurado.", 503);
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return erro("Sua sessão expirou. Entre novamente para continuar.", 403);
  } catch {
    return erro("Não foi possível verificar sua sessão. Tente entrar novamente.", 503);
  }

  let entrada;
  try {
    const body = await request.text();
    if (body.length > 40000) return erro("O texto enviado é muito grande. Reduza suas respostas.", 413);
    entrada = JSON.parse(body);
  } catch {
    return erro("Não foi possível ler os campos enviados. Tente novamente.", 400);
  }

  try {
    const texto = await gerarResposta(entrada);
    return new Response(texto, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ErroIA) return erro(error.message, error.status);
    return erro("Não foi possível montar seu currículo. Tente novamente.", 500);
  }
}
