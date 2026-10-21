"use client";

import { useActionState } from "react";
import { sair } from "./login/actions";

export default function Sair() {
  const [state, action, pending] = useActionState(sair, {});
  return (
    <form action={action}>
      <button type="submit" disabled={pending}>{pending ? "Saindo..." : "Sair"}</button>
      {state.error && <p role="alert" className="erro">{state.error}</p>}
    </form>
  );
}
