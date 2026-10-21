import { NextResponse } from "next/server";
import { createClient, hasSupabaseConfig } from "../../../lib/supabase/server";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code && hasSupabaseConfig()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return new NextResponse(null, { status: 303, headers: { Location: "/" } });
    } catch {}
  }
  return new NextResponse(null, { status: 303, headers: { Location: "/login?erro=confirmacao" } });
}
