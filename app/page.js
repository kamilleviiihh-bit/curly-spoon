import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfig } from "../lib/supabase/server";
import Analisador from "./analisador";
import Sair from "./sair";
import { desafio } from "../desafio";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!hasSupabaseConfig()) redirect("/login");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  return (
    <>
      <header className="topo">
        <span className="email-usuario">{user.email}</span>
        <Sair />
      </header>
      <Analisador desafio={{
        nome: desafio.nome, subtitulo: desafio.subtitulo, campos: desafio.campos,
        botao: desafio.botao, aviso: desafio.aviso,
      }} />
    </>
  );
}
