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
${campos.escola ? `\nFORMAÇÃO\n${campos.escola}\n` : ""}${campos.cursos ? `\nCURSOS\n${campos.cursos}\n` : ""}${campos.experiencias ? `\nEXPERIÊNCIAS\n${campos.experiencias}\n` : ""}${campos.hard_skills ? `\nHARD SKILLS\n${campos.hard_skills}\n` : ""}${campos.soft_skills ? `\nSOFT SKILLS\n${campos.soft_skills}\n` : ""}
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
        stream: false,
        reasoning: { effort: "none" },
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

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ErroIA("A inteligência artificial não retornou uma resposta válida. Tente novamente.");
  }

  const choice = data?.choices?.[0];
  const providerError = data?.error || choice?.error;
  if (providerError) {
    const code = Number(providerError.code);
    if (code === 429) throw new ErroIA("Você atingiu o limite de uso de hoje.", 429);
    if (code === 401) throw new ErroIA("Chave da IA inválida.", 401);
    if (code === 402) throw new ErroIA("A conta da IA não tem saldo disponível. Verifique a conta na OpenRouter.", 503);
    throw new ErroIA("O serviço de IA não conseguiu concluir o pedido. Tente novamente em instantes.");
  }

  if (choice?.finish_reason === "content_filter" || choice?.message?.refusal) {
    throw new ErroIA("A inteligência artificial não pôde responder a esse conteúdo. Revise os campos e tente novamente.");
  }

  const content = choice?.message?.content;
  // OpenRouter supports plain strings and arrays of typed content blocks.
  // Never expose reasoning, tool calls or other internal content as the résumé.
  const texto = typeof content === "string" ? content : Array.isArray(content)
    ? content.filter((parte) => parte?.type === "text" && typeof parte.text === "string")
      .map((parte) => parte.text).join("")
    : "";

  if (choice?.finish_reason === "length" || choice?.finish_reason === "error" || !texto.trim()) {
    // Log only structural diagnostics: no prompts, responses, credentials or personal data.
    console.warn("OpenRouter: resposta sem conclusão", {
      motivo: ["length", "error", "stop"].includes(choice?.finish_reason) ? choice.finish_reason : "outro",
      temTexto: Boolean(texto.trim()),
      temRaciocinio: Boolean(choice?.message?.reasoning || choice?.message?.reasoning_details?.length),
    });
    if (choice?.finish_reason === "length") {
      throw new ErroIA("A IA atingiu o limite antes de concluir o currículo. Reduza os textos e tente novamente.");
    }
    throw new ErroIA("A inteligência artificial não retornou uma resposta válida. Tente novamente.");
  }
  return texto;
}
