"use client";

import { useRef, useState } from "react";
import ModelosCurriculo from "./modelos-curriculo";

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
      <div className="ferramenta-curriculo">
        <header className="cabecalho-ferramenta">
          <div>
            <h1>{desafio.nome}</h1>
            <p className="slogan">Soluções inteligentes ao seu alcance.</p>
          </div>
          <nav className="navegacao-ferramenta" aria-label="Seções do criador de currículo">
            <a href="#dados-curriculo">Seus dados</a>
            <a href="#resultado-curriculo">Resultado</a>
            <a href="#modelos-curriculo">Modelos</a>
          </nav>
        </header>
        <div className="area-trabalho">
          <section className="painel-dados" id="dados-curriculo" aria-labelledby="titulo-dados">
            <header className="cabecalho-secao">
              <span className="etapa-ferramenta" aria-hidden="true">01</span>
              <div>
                <h2 id="titulo-dados">Seus dados</h2>
                <p>{desafio.subtitulo}</p>
              </div>
            </header>
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
          </section>
          <section className="resultado resultado-painel" id="resultado-curriculo" aria-labelledby="titulo-resultado" aria-live="polite" aria-busy={analisando}>
            <header className="cabecalho-secao">
              <span className="etapa-ferramenta" aria-hidden="true">02</span>
              <div>
                <h2 id="titulo-resultado">Seu currículo</h2>
                <p>Confira a resposta antes de usar e veja os modelos abaixo.</p>
              </div>
            </header>
            <div className="area-resposta">{resposta || (
              <div className="resultado-vazio">
                <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="10" y="5" width="28" height="38" rx="4" stroke="currentColor" strokeWidth="2" /><path d="M17 15h14M17 23h14M17 31h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <p>Seu currículo aparecerá aqui.</p>
                <span>Preencha seus dados e clique em “{desafio.botao}”.</span>
              </div>
            )}</div>
          </section>
        </div>
        <ModelosCurriculo resposta={resposta} />
      </div>
    </main>
  );
}
