"use client";

import { useActionState, useState } from "react";
import { solicitarRecuperacao } from "./actions";

export default function FormularioRecuperacao({ linkInvalido }) {
  const [email, setEmail] = useState("");
  const [state, action, pending] = useActionState(solicitarRecuperacao, {});
  return (
    <form action={action} className="formulario" noValidate>
      <label htmlFor="email-recuperacao">E-mail da sua conta</label>
      <input id="email-recuperacao" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required aria-describedby="mensagem-recuperacao" />
      <div id="mensagem-recuperacao" aria-live="polite" aria-atomic="true">
        {(state.error || (linkInvalido && !state.message)) && <p role="alert" className="erro">{state.error || "O link de recuperação é inválido ou expirou. Solicite um novo link e abra-o no mesmo navegador."}</p>}
        {state.message && <p role="status" className="mensagem-sucesso">{state.message}</p>}
      </div>
      <button type="submit" disabled={pending}>{pending ? "Enviando..." : "Enviar link de recuperação"}</button>
    </form>
  );
}
