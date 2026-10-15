"use client";

import { useState } from "react";

// Troque estes textos para personalizar a página.
const TITULO = "Analisador de Texto";
const DESCRICAO = "Digite um texto abaixo e clique em Analisar para ver o resultado.";

export default function Home() {
  const [texto, setTexto] = useState("");
  const [resposta, setResposta] = useState("");

  function analisar(evento) {
    evento.preventDefault();
    setResposta(texto);
  }

  return (
    <main className="pagina">
      <section className="conteudo">
        <h1>{TITULO}</h1>
        <p className="descricao">{DESCRICAO}</p>

        <form onSubmit={analisar} className="formulario">
          <label htmlFor="texto">Seu texto</label>
          <textarea
            id="texto"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            placeholder="Escreva algo aqui..."
            rows={6}
          />
          <button type="submit">Analisar</button>
        </form>

        <section className="resultado" aria-live="polite">
          <h2>Resposta</h2>
          <div className="area-resposta">{resposta}</div>
        </section>
      </section>
    </main>
  );
}
