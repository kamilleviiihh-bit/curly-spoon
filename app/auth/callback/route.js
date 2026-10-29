import { NextResponse } from "next/server";
import { createClient, hasSupabaseConfig } from "../../../lib/supabase/server";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const recuperacao = url.searchParams.get("fluxo") === "recuperacao";
  if (code && hasSupabaseConfig()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return new NextResponse(null, { status: 303, headers: { Location: recuperacao ? "/redefinir-senha" : "/", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
    } catch {}
  }
  return new NextResponse(null, { status: 303, headers: { Location: recuperacao ? "/esqueci-senha?erro=link" : "/login?erro=confirmacao", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
