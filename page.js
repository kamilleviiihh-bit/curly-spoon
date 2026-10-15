"use client";

import { useState } from "react";

// Troque estes textos para personalizar a página.
const TITULO = "Curly Spoon!";
const DESCRICAO = "Digite um texto abaixo e clique em Analisar para ver o resultado.";
const ROTULO_CAMPO = "Seu texto";
const PLACEHOLDER = "Escreva algo aqui...";
const TEXTO_BOTAO = "Analisar";
const TITULO_RESPOSTA = "Resposta";

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
          <label htmlFor="texto">{ROTULO_CAMPO}</label>
          <textarea
            id="texto"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            placeholder={PLACEHOLDER}
            rows={6}
          />
          <button type="submit">{TEXTO_BOTAO}</button>
        </form>

        <section className="resultado" aria-live="polite">
          <h2>{TITULO_RESPOSTA}</h2>
          <div className="area-resposta">{resposta}</div>
        </section>
      </section>
    </main>
  );
}

