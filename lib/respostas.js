import { desafio } from "../desafio.js";
import { validarCampos } from "./ia.js";

export function formatarEntrada(entrada) {
  const campos = validarCampos(entrada);
  return desafio.campos.map(({ id, rotulo }) => `${rotulo}:\n${campos[id]}`).join("\n\n");
}

export async function salvarResposta(supabase, entrada, resposta) {
  // The session and the database default auth.uid() determine ownership.
  // Do not accept a user_id supplied by the browser or use a service-role key.
  const { error } = await supabase.from("respostas").insert({
    entrada: formatarEntrada(entrada),
    resposta,
  });
  if (error) throw new Error("Não foi possível salvar no histórico.");
}

export async function carregarHistorico(supabase, userId, pagina = 1) {
  const tamanhoPagina = 20;
  const inicio = (pagina - 1) * tamanhoPagina;
  return supabase.from("respostas")
    .select("id, entrada, resposta, criado_em", { count: "exact" })
    .eq("user_id", userId)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(inicio, inicio + tamanhoPagina - 1);
}
