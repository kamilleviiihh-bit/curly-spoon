import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfig } from "../../lib/supabase/server";
import { carregarHistorico } from "../../lib/respostas";
import Topo from "../topo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meu histórico — Crie seu 1° curriculo!" };

function formatarData(valor) {
  const data = new Date(valor);
  if (!valor || Number.isNaN(data.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo",
  }).format(data);
}

export default async function Historico({ searchParams }) {
  if (!hasSupabaseConfig()) redirect("/login");
  const supabase = await createClient();
  let user;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = data.user;
  } catch {}
  if (!user) redirect("/login");

  const params = await searchParams;
  const numero = Number(params.pagina);
  const pagina = Number.isSafeInteger(numero) && numero > 0 && numero <= 100000 ? numero : 1;
  let registros = [];
  let total = 0;
  let falhou = false;
  try {
    const { data, error, count } = await carregarHistorico(supabase, user.id, pagina);
    if (error) falhou = true;
    else {
      registros = data || [];
      total = count || 0;
    }
  } catch {
    falhou = true;
  }

  return (
    <>
      <Topo email={user.email} historico />
      <main className="pagina pagina-historico">
        <section className="conteudo">
          <h1>Meu histórico</h1>
          <p className="descricao">Seus currículos, do mais recente para o mais antigo. Horários de Brasília.</p>
          <Link href="/" className="link-voltar">Criar novo currículo</Link>
          {falhou ? (
            <p className="erro" role="alert">Não foi possível carregar seu histórico. <Link href="/historico">Tente novamente.</Link></p>
          ) : registros.length === 0 ? (
            <p className="historico-vazio">{pagina === 1 ? "Você ainda não tem respostas salvas. Monte seu primeiro currículo para começar." : "Não há respostas nesta página."}</p>
          ) : (
            <ol className="lista-historico">
              {registros.map((registro) => (
                <li key={registro.id}>
                  <article className="item-historico">
                    <h2>Currículo de <time dateTime={registro.criado_em || undefined}>{formatarData(registro.criado_em)}</time></h2>
                    <details>
                      <summary>Ver informações enviadas</summary>
                      <p className="entrada-historico">{registro.entrada}</p>
                    </details>
                    <h3>Resposta</h3>
                    <div className="area-resposta">{registro.resposta}</div>
                  </article>
                </li>
              ))}
            </ol>
          )}
          {!falhou && (pagina > 1 || total > pagina * 20) && (
            <nav className="paginacao-historico" aria-label="Páginas do histórico">
              {pagina > 1 && <Link href={`/historico?pagina=${pagina - 1}`}>Página anterior</Link>}
              <span>Página {pagina}</span>
              {total > pagina * 20 && <Link href={`/historico?pagina=${pagina + 1}`}>Próxima página</Link>}
            </nav>
          )}
        </section>
      </main>
    </>
  );
}
