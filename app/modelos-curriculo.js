"use client";

import { useRef, useState } from "react";
import { separarSecoes } from "./modelos-formatacao";

const modelos = [
  { id: "classico", nome: "Clássico", descricao: "Uma coluna, cabeçalho centralizado e tipografia clássica." },
  { id: "moderno", nome: "Moderno", descricao: "Barra lateral azul para cursos e habilidades; experiências ao lado." },
  { id: "essencial", nome: "Essencial", descricao: "Cabeçalho compacto e seções organizadas em dois blocos por linha." },
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

function SecaoModelo({ secao }) {
  return (
    <section className="secao-folha">
      <h4>{secao.titulo}</h4>
      <div className="conteudo-secao-folha">{secao.linhas.join("\n")}</div>
    </section>
  );
}

function FolhaCurriculo({ modelo, texto }) {
  const { cabecalho, secoes } = separarSecoes(texto);
  const lateral = new Set(["CURSOS", "HARD SKILLS", "SOFT SKILLS", "HABILIDADES"]);
  const renderizar = (lista) => lista.map(({ secao, indice }) => <SecaoModelo key={indice} secao={secao} />);
  const itens = secoes.map((secao, indice) => ({ secao, indice }));
  return (
    <div className={`folha-curriculo modelo-${modelo}`}>
      {cabecalho.length > 0 && <div className="cabecalho-folha">{cabecalho.join("\n")}</div>}
      {modelo === "moderno" ? (
        <div className="corpo-folha-moderno">
          <aside className="lateral-folha">{renderizar(itens.filter(({ secao }) => lateral.has(secao.tipo)))}</aside>
          <div className="principal-folha">{renderizar(itens.filter(({ secao }) => !lateral.has(secao.tipo)))}</div>
        </div>
      ) : (
        <div className="secoes-folha">{renderizar(itens)}</div>
      )}
    </div>
  );
}

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
              <FolhaCurriculo modelo={modelo.id} texto={texto} />
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
          <FolhaCurriculo modelo={selecionado.id} texto={texto} />
        </div>
      </dialog>
    </section>
  );
}
