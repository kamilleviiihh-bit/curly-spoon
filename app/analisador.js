"use client";

import { useRef, useState } from "react";

export default function Analisador({ desafio }) {
  const [campos, setCampos] = useState({});
  const [resposta, setResposta] = useState("");
  const [erro, setErro] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const enviando = useRef(false);

  async function analisar(evento) {
    evento.preventDefault();
    if (enviando.current) return;
    enviando.current = true;
    setAnalisando(true);
    setErro("");
    setResposta("");
    try {
      const resultado = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campos),
        signal: AbortSignal.timeout(60000),
      });
      if (resultado.status === 429) throw new Error("Você atingiu o limite de uso de hoje.");
      if (resultado.status === 401) throw new Error("Chave da IA inválida.");
      if (!resultado.ok) {
        const data = await resultado.json().catch(() => null);
        throw new Error(data?.erro || "Não foi possível montar seu currículo. Tente novamente.");
      }
      const texto = await resultado.text();
      if (!texto.trim()) throw new Error("A resposta veio vazia. Tente novamente.");
      setResposta(texto);
      if (resultado.headers.get("X-Historico-Salvo") === "nao") {
        setErro("Seu currículo foi gerado, mas não foi possível salvar no histórico. Copie o texto abaixo para não perdê-lo.");
      }
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        setErro("A resposta demorou mais que o esperado. Tente novamente.");
      } else if (error instanceof TypeError) {
        setErro("Não foi possível conectar. Verifique sua conexão e tente novamente.");
      } else {
        setErro(error.message || "Não foi possível montar seu currículo. Tente novamente.");
      }
    } finally {
      enviando.current = false;
      setAnalisando(false);
    }
  }

  return (
    <main className="pagina pagina-principal">
      <section className="conteudo conteudo-formulario">
        <h1>{desafio.nome}</h1>
        <p className="slogan">Soluções inteligentes ao seu alcance.</p>
        <p className="descricao">{desafio.subtitulo}</p>
        <form onSubmit={analisar} className="formulario" aria-busy={analisando}>
          {desafio.campos.map(({ id, rotulo, linhas }) => (
            <div className="campo-curriculo" key={id}>
              <label htmlFor={id}>{rotulo}</label>
              <textarea
                id={id}
                name={id}
                rows={linhas}
                maxLength={6000}
                value={campos[id] || ""}
                onChange={(evento) => setCampos((anteriores) => ({ ...anteriores, [id]: evento.target.value }))}
              />
            </div>
          ))}
          <button type="submit" disabled={analisando}>
            {analisando ? "Analisando..." : desafio.botao}
          </button>
          <small className="aviso-ia">{desafio.aviso}</small>
          {analisando && <p role="status">Montando seu currículo...</p>}
          {erro && <p className="erro" role="alert">{erro}</p>}
        </form>
        <section className="resultado" aria-live="polite" aria-busy={analisando}>
          <h2>Resposta</h2>
          <div className="area-resposta">{resposta}</div>
        </section>
      </section>
    </main>
  );
}
