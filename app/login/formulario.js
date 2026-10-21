"use client";

import { useActionState, useState } from "react";
import { autenticar } from "./actions";

export default function FormularioLogin({ erroConfirmacao }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, action, pending] = useActionState(autenticar, {});
  return (
    <form action={action} className="formulario" noValidate>
      <label htmlFor="email">E-mail</label>
      <input id="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required aria-describedby="mensagem-login" />
      <label htmlFor="password">Senha</label>
      <input id="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required aria-describedby="mensagem-login" />
      <div id="mensagem-login" aria-live="polite" aria-atomic="true">
        {(state.error || erroConfirmacao) && <p className="erro" role="alert">{state.error || erroConfirmacao}</p>}
        {state.message && <p role="status">{state.message}</p>}
      </div>
      <div className="acoes-login">
        <button type="submit" name="intent" value="login" disabled={pending}>Entrar</button>
        <button type="submit" name="intent" value="signup" className="botao-secundario" disabled={pending}>Criar conta</button>
      </div>
      {pending && <p role="status">Aguarde...</p>}
    </form>
  );
}
