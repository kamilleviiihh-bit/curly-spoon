import { desafio } from "../desafio.js";

export class ErroIA extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

export function validarCampos(entrada, config = desafio) {
  if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) {
    throw new ErroIA("Envie os campos do formulário em um formato válido.", 400);
  }
  const campos = {};
  for (const { id } of config.campos) {
    const valor = entrada[id] ?? "";
    if (typeof valor !== "string" || valor.length > 6000) {
      throw new ErroIA("Cada resposta deve ser um texto com até 6.000 caracteres.", 400);
    }
    campos[id] = valor.trim();
  }
  if (!Object.values(campos).some(Boolean)) {
    throw new ErroIA("Preencha pelo menos um campo para montar seu currículo.", 400);
  }
  return campos;
}

export function montarPrompt(campos, config = desafio) {
  // Substitute only once, so placeholders inside a person's answer stay literal.
  return config.prompt.replace(/\{([a-zA-Z0-9_]+)\}/g, (original, id) =>
    Object.hasOwn(campos, id) ? campos[id] : original,
  );
}

export async function gerarResposta(entrada, {
  config = desafio,
  apiKey = process.env.OPENROUTER_API_KEY,
  fetchImpl = fetch,
} = {}) {
  const campos = validarCampos(entrada, config);
  if (config.modoTeste) {
    return `EXEMPLO DE TESTE — nenhuma IA foi chamada.

[Seu nome]
[Cidade] · [telefone] · [e-mail]

OBJETIVO: ${campos.objetivo || "[Preencha o tipo de vaga desejada]"}
${campos.escola ? `\nFORMAÇÃO\n${campos.escola}\n` : ""}${campos.cursos ? `\nCURSOS\n${campos.cursos}\n` : ""}${campos.atividades ? `\nEXPERIÊNCIAS E ATIVIDADES\n${campos.atividades}\n` : ""}${campos.habilidades ? `\nHABILIDADES\n${campos.habilidades}\n` : ""}
Este é um exemplo com os dados que você preencheu. A versão com IA organiza e reescreve essas informações.`;
  }
  if (!apiKey) throw new ErroIA("A inteligência artificial ainda não foi configurada. Tente novamente mais tarde.", 503);

  let response;
  try {
    response = await fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.modelo,
        messages: [{ role: "user", content: montarPrompt(campos, config) }],
        max_tokens: 900,
      }),
      signal: AbortSignal.timeout(45000),
      cache: "no-store",
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new ErroIA("A inteligência artificial demorou para responder. Tente novamente.", 504);
    }
    throw new ErroIA("Não foi possível conectar à inteligência artificial. Tente novamente.");
  }
  if (response.status === 429) throw new ErroIA("Você atingiu o limite de uso de hoje.", 429);
  if (response.status === 401) throw new ErroIA("Chave da IA inválida.", 401);
  if (!response.ok) throw new ErroIA("A inteligência artificial está indisponível no momento. Tente novamente mais tarde.");

  try {
    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content;
    if (typeof texto !== "string" || !texto.trim()) throw new Error("empty response");
    return texto;
  } catch {
    throw new ErroIA("A inteligência artificial não retornou uma resposta válida. Tente novamente.");
  }
}
