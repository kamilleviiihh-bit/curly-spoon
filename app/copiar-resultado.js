"use client";

import { useState } from "react";

export default function CopiarResultado({ texto, disabled = false }) {
  const [status, setStatus] = useState("");
  const copiando = status === "copiando";

  async function copiar() {
    if (!texto || disabled || copiando) return;
    setStatus("copiando");
    try {
      await navigator.clipboard.writeText(texto);
      setStatus("copiado");
    } catch {
      setStatus("erro");
    }
  }

  return (
    <div className="copiar-resultado">
      <button type="button" onClick={copiar} disabled={!texto || disabled || copiando} aria-label="Copiar resultado" aria-busy={copiando}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="11" height="12" rx="2" /><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" /></svg>
        {copiando ? "Copiando..." : status === "copiado" ? "Copiado!" : "Copiar resultado"}
      </button>
      <p className="aviso-copia" role="status" aria-live="polite">
        {status === "copiado" && "Resultado copiado para a área de transferência."}
        {status === "erro" && "Não foi possível copiar automaticamente. Selecione o texto do resultado e copie manualmente."}
      </p>
    </div>
  );
}
