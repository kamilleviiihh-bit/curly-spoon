"use client";

import { useRef, useState } from "react";

const modelos = [
  { id: "classico", nome: "Clássico", descricao: "Tipografia tradicional e divisões discretas." },
  { id: "moderno", nome: "Moderno", descricao: "Faixa lateral azul e detalhes em verde-água." },
  { id: "essencial", nome: "Essencial", descricao: "Visual compacto, direto e com mais espaço livre." },
];

const exemplo = `[Seu nome]
[Cidade] · [telefone] · [e-mail]

OBJETIVO
[Objetivo informado por você]

FORMAÇÃO
[Escola informada por você]

CURSOS
[Cursos informados por você]

EXPERIÊNCIAS
[Experiências informadas por você]

HARD SKILLS
[Habilidades técnicas informadas por você]

SOFT SKILLS
[Habilidades comportamentais informadas por você]`;

export default function ModelosCurriculo({ resposta }) {
  const dialog = useRef(null);
  const [selecionado, setSelecionado] = useState(modelos[0]);
  const texto = resposta || exemplo;

  function visualizar(modelo) {
    setSelecionado(modelo);
    dialog.current.showModal();
  }

  return (
    <section className="secao-modelos" id="modelos-curriculo" aria-labelledby="titulo-modelos">
      <header className="cabecalho-secao">
        <span className="etapa-ferramenta" aria-hidden="true">03</span>
        <div>
          <h2 id="titulo-modelos">Três modelos de currículo</h2>
          <p>{resposta
            ? "Veja o mesmo texto do seu currículo em três estilos. Os modelos não acrescentam informações."
            : "Explore os estilos abaixo. Os campos entre colchetes são ilustrativos; após gerar, os três modelos mostram o seu texto."}</p>
        </div>
      </header>
      <div className="grade-modelos">
        {modelos.map((modelo) => (
          <article className="cartao-modelo" key={modelo.id}>
            <div className="miniatura-modelo" aria-hidden="true">
              <div className={`folha-curriculo modelo-${modelo.id}`}>
                <pre className="texto-modelo">{texto}</pre>
              </div>
            </div>
            <div className="descricao-modelo">
              <h3>{modelo.nome}</h3>
              <p>{modelo.descricao}</p>
              <button type="button" className="botao-modelo" onClick={() => visualizar(modelo)} aria-label={`Visualizar modelo ${modelo.nome}`}>Visualizar modelo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg></button>
            </div>
          </article>
        ))}
      </div>
      <dialog ref={dialog} className="dialog-modelo" aria-labelledby="titulo-modelo-aberto">
        <div className="barra-modelo">
          <div>
            <h2 id="titulo-modelo-aberto">Modelo {selecionado.nome}</h2>
            <p>{resposta ? "Mesmo conteúdo da resposta gerada." : "Prévia ilustrativa com campos para preencher."}</p>
          </div>
          <button type="button" className="botao-secundario" onClick={() => dialog.current.close()}>Fechar</button>
        </div>
        <div className="visualizacao-modelo">
          <div className={`folha-curriculo modelo-${selecionado.id}`}>
            <pre className="texto-modelo">{texto}</pre>
          </div>
        </div>
      </dialog>
    </section>
  );
}
