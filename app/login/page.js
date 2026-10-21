import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfig } from "../../lib/supabase/server";
import FormularioLogin from "./formulario";

export default async function Login({ searchParams }) {
  let user = null;
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {}
  }
  if (user) redirect("/");
  const params = await searchParams;
  return (
    <main className="pagina">
      <section className="conteudo">
        <h1>Entrar</h1>
        <p className="descricao">Entre ou crie sua conta para acessar o Analisador de Texto.</p>
        <FormularioLogin erroConfirmacao={params.erro ? "Não foi possível confirmar seu e-mail. O link pode ter expirado. Tente entrar ou solicite um novo cadastro." : null} />
      </section>
    </main>
  );
}
