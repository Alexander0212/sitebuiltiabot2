export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function getLlmConfig(): LlmConfig | null {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    baseUrl: (
      process.env.GEMINI_BASE_URL ??
      "https://generativelanguage.googleapis.com/v1beta"
    ).replace(/\/$/, ""),
    model: process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash",
  };
}

type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

type LlmJson = {
  text: string;
  propertySlugs?: string[];
  handoff?: boolean;
  needsContact?: boolean;
};

type GeminiPart = { text?: string };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

function toGeminiPayload(messages: ChatTurn[]) {
  const systemParts: string[] = [];
  const contents: GeminiContent[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemParts.push(message.content);
      continue;
    }

    const role = message.role === "assistant" ? "model" : "user";
    const last = contents.at(-1);
    if (last?.role === role && last.parts[0]) {
      last.parts[0].text = `${last.parts[0].text}\n\n${message.content}`;
      continue;
    }

    contents.push({ role, parts: [{ text: message.content }] });
  }

  if (contents[0]?.role === "model") {
    contents.unshift({
      role: "user",
      parts: [{ text: "Продовжуй консультацію." }],
    });
  }

  systemParts.push(
    'Відповідай JSON: {"text": string, "propertySlugs": string[], "handoff": boolean, "needsContact": boolean}. text: відповідь клієнту мовою клієнта (uk або ru), без тире і лапок. Ніколи не стверджуй, що заявку вже надіслано.',
  );

  return {
    systemInstruction: systemParts.join("\n\n"),
    contents,
  };
}

function extractText(payload: unknown) {
  const data = payload as {
    candidates?: { content?: { parts?: GeminiPart[] } }[];
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function parseModelJson(raw: string): LlmJson | null {
  const trimmed = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(trimmed) as LlmJson;
    if (typeof parsed.text !== "string" || parsed.text.trim().length < 1) {
      return null;
    }

    return {
      text: parsed.text.trim(),
      propertySlugs: Array.isArray(parsed.propertySlugs)
        ? parsed.propertySlugs.filter((item) => typeof item === "string")
        : [],
      handoff: Boolean(parsed.handoff),
      needsContact: Boolean(parsed.needsContact),
    };
  } catch {
    return null;
  }
}

export async function completeChat(
  config: LlmConfig,
  messages: ChatTurn[],
): Promise<LlmJson | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28_000);
  const { systemInstruction, contents } = toGeminiPayload(messages);

  if (contents.length === 0) {
    return null;
  }

  try {
    const response = await fetch(
      `${config.baseUrl}/models/${encodeURIComponent(config.model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.55,
            thinkingConfig: {
              thinkingLevel: "minimal",
            },
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                text: { type: "STRING" },
                propertySlugs: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                handoff: { type: "BOOLEAN" },
                needsContact: { type: "BOOLEAN" },
              },
              required: ["text"],
            },
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("agent_llm_http", {
        status: response.status,
        body: body.slice(0, 500),
      });
      return null;
    }

    const content = extractText(await response.json());
    if (!content) {
      return null;
    }

    return parseModelJson(content);
  } catch (error) {
    console.error("agent_llm_failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
