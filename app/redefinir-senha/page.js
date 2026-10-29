import Link from "next/link";
import { createClient, hasSupabaseConfig } from "../../lib/supabase/server";
import FormularioNovaSenha from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova senha — Crie seu 1° curriculo!" };

export default async function RedefinirSenha() {
  let user = null;
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    } catch {}
  }
  return (
    <main className="pagina pagina-login">
      <section className="conteudo">
        <h1>Nova senha</h1>
        {user ? (
          <>
            <p className="descricao">Escolha uma senha com pelo menos 6 caracteres.</p>
            <FormularioNovaSenha />
          </>
        ) : (
          <>
            <p className="erro" role="alert">Abra o link enviado por e-mail neste mesmo navegador. Se ele expirou, solicite outro.</p>
            <Link href="/esqueci-senha" className="link-recuperacao">Solicitar novo link</Link>
          </>
        )}
      </section>
    </main>
  );
}
