/**
 * Gemini models for NOVA ESTATE chat (paid tier, USD per 1M tokens).
 * Prices from Google AI / Cloud docs — approximate; check ai.google.dev/pricing.
 *
 * Free tier often has $0 usage with lower rate limits (product may train on data).
 */

export type LlmModelId =
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-3.8-flash"
  | "gemini-3.6-flash"
  | "gemini-3.5-flash"
  | "gemini-2.5-pro"
  | "gemini-3.1-pro-preview";

export type LlmModelInfo = {
  id: LlmModelId;
  label: string;
  inputPer1M: number;
  outputPer1M: number;
  note: string;
  /** Prefer lower temperature + minimal thinking for chat UX. */
  thinking: "minimal" | "low" | "none";
};

export const LLM_MODELS: Record<LlmModelId, LlmModelInfo> = {
  "gemini-2.5-flash-lite": {
    id: "gemini-2.5-flash-lite",
    label: "2.5 Flash-Lite",
    inputPer1M: 0.1,
    outputPer1M: 0.4,
    note: "Найдешевша. Ок для простих реплік, слабша на нюансах підбору.",
    thinking: "minimal",
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    label: "2.5 Flash (закрита)",
    inputPer1M: 0.3,
    outputPer1M: 2.5,
    note: "Для нових ключів Google більше не відкриває.",
    thinking: "minimal",
  },
  "gemini-3.8-flash": {
    id: "gemini-3.8-flash",
    label: "3.8 Flash",
    inputPer1M: 0.75,
    outputPer1M: 3.75,
    note: "Робоча заміна 2.5 Flash. Дешевша за Pro.",
    thinking: "low",
  },
  "gemini-3.6-flash": {
    id: "gemini-3.6-flash",
    label: "3.6 Flash (зараз у проєкті)",
    inputPer1M: 0.75,
    outputPer1M: 3.75,
    note: "Поточний дефолт. Промо-ціна ~до кінця 2026, далі дорожче.",
    thinking: "minimal",
  },
  "gemini-3.5-flash": {
    id: "gemini-3.5-flash",
    label: "3.5 Flash",
    inputPer1M: 1.5,
    outputPer1M: 9.0,
    note: "Розумніший Flash, помітно дорожчий за 2.5/3.6.",
    thinking: "minimal",
  },
  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    label: "2.5 Pro (legacy)",
    inputPer1M: 1.25,
    outputPer1M: 10.0,
    note: "Багато акаунтів більше не відкривають — Google просить 3.1 Pro Preview.",
    thinking: "none",
  },
  "gemini-3.1-pro-preview": {
    id: "gemini-3.1-pro-preview",
    label: "3.1 Pro Preview",
    inputPer1M: 2.0,
    outputPer1M: 12.0,
    note: "Актуальна Pro-заміна для консультацій.",
    thinking: "none",
  },
};

/** Active project default — override with GEMINI_MODEL in .env.local */
export const DEFAULT_LLM_MODEL: LlmModelId = "gemini-3.8-flash";

const RETIRED_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
]);

export function resolveLlmModel(raw?: string | null): LlmModelInfo {
  const requested = raw?.trim() || DEFAULT_LLM_MODEL;
  const id = (
    RETIRED_MODELS.has(requested) ? DEFAULT_LLM_MODEL : requested
  ) as LlmModelId;
  return LLM_MODELS[id] ?? LLM_MODELS[DEFAULT_LLM_MODEL];
}

/** Rough cost for one typical chat turn (3k in + 250 out tokens). */
export function estimateTurnUsd(model: LlmModelInfo) {
  return (3000 * model.inputPer1M + 250 * model.outputPer1M) / 1_000_000;
}
