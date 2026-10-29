import Link from "next/link";
import FormularioRecuperacao from "./formulario";

export const metadata = { title: "Esqueci a senha — Crie seu 1° curriculo!" };

export default async function EsqueciSenha({ searchParams }) {
  const params = await searchParams;
  return (
    <main className="pagina pagina-login">
      <section className="conteudo">
        <h1>Esqueci a senha</h1>
        <p className="descricao">Informe seu e-mail para receber um link e criar uma nova senha.</p>
        <FormularioRecuperacao linkInvalido={params.erro === "link"} />
        <Link href="/login" className="link-recuperacao">Voltar para entrar</Link>
      </section>
    </main>
  );
}
