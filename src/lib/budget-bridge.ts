import type { ClientGoal } from "@/types/agent";

const STORAGE_KEY = "nova-budget-bridge";

export type BudgetBridge = {
  maximumPropertyBudget: number;
  goal: ClientGoal;
  updatedAt: number;
};

export function saveBudgetBridge(data: Omit<BudgetBridge, "updatedAt">) {
  try {
    const payload: BudgetBridge = {
      ...data,
      updatedAt: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("nova-budget-bridge", { detail: payload }));
  } catch {
    // ignore
  }
}

export function readBudgetBridge(): BudgetBridge | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as BudgetBridge;
    if (
      typeof parsed.maximumPropertyBudget !== "number" ||
      parsed.maximumPropertyBudget < 30_000 ||
      parsed.maximumPropertyBudget > 2_000_000
    ) {
      return null;
    }

    return {
      maximumPropertyBudget: Math.round(parsed.maximumPropertyBudget),
      goal: parsed.goal === "invest" ? "invest" : "live",
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export function budgetBridgeQuickReply(bridge: BudgetBridge) {
  const rounded = Math.round(bridge.maximumPropertyBudget / 1000) * 1000;
  return {
    label: `Бюджет з калькулятора · $${rounded.toLocaleString("uk-UA")}`,
    message: `Мій комфортний бюджет з калькулятора: до ${rounded}`,
  };
}
