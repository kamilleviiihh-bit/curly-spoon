"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { redefinirSenha } from "./actions";

export default function FormularioNovaSenha() {
  const [password, setPassword] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [state, action, pending] = useActionState(redefinirSenha, {});
  if (state.concluido) return (
    <div>
      <p role="status" className="mensagem-sucesso">Senha atualizada com sucesso. Você já pode usar a nova senha nos próximos acessos.</p>
      <Link href="/" className="link-recuperacao">Ir para o site</Link>
    </div>
  );
  return (
    <form action={action} className="formulario" noValidate>
      <label htmlFor="nova-senha">Nova senha</label>
      <input id="nova-senha" name="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} aria-describedby="mensagem-nova-senha" />
      <label htmlFor="confirmar-senha">Confirme a nova senha</label>
      <input id="confirmar-senha" name="confirmacao" type="password" autoComplete="new-password" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} required minLength={6} aria-describedby="mensagem-nova-senha" />
      <div id="mensagem-nova-senha" aria-live="polite" aria-atomic="true">
        {state.error && <p className="erro" role="alert">{state.error}</p>}
      </div>
      <button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar nova senha"}</button>
    </form>
  );
}
