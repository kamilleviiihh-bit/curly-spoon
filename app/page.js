"use client";

import { useState } from "react";

export default function Home() {
  const [texto, setTexto] = useState("");
  const [resposta, setResposta] = useState("");

  function analisar(event) {
    event.preventDefault();
    setResposta(texto);
  }

  return (
    <main className="container">
      <section className="painel">
        <h1>Analisador de Texto</h1>
        <p className="descricao">Digite uma mensagem e veja o resultado abaixo.</p>
        <form onSubmit={analisar}>
          <label htmlFor="texto">Seu texto</label>
          <textarea id="texto" value={texto} onChange={(event) => setTexto(event.target.value)} placeholder="Escreva seu texto aqui..." rows={5} />
          <button type="submit">Analisar</button>
        </form>
        <section className="resultado" aria-live="polite" aria-label="Resposta">
          <h2>Resposta</h2>
          <p>{resposta}</p>
        </section>
      </section>
    </main>
  );
}
