import { nextBookingField } from "@/lib/agent/booking-flow";
import { meetingLabel } from "@/lib/agent/meeting";
import type { AgentSession, UserPreferences } from "@/types/agent";

/**
 * Compact client snapshot for the LLM — facts only, no raw JSON dump.
 * Keeps the model grounded and reduces invented booking claims.
 */
export function formatClientState(session: AgentSession): string {
  const p = session.preferences;
  const bookingField = nextBookingField(p);
  const bookingLine =
    p.bookingStatus === "submitted"
      ? "заявку ВЖЕ збережено бекендом — можна підтвердити клієнту"
      : bookingField
        ? `запис у процесі; бракує поля: ${bookingFieldLabel(bookingField, p)}`
        : p.bookingStatus === "collecting"
          ? "усі поля зібрані — НЕ підтверджуй запис; бекенд збереже сам"
          : "запис ще не відкрито";

  const lines = [
    `мова: ${p.lang ?? "uk"}`,
    `мета: ${p.goal ?? "—"} / намір: ${p.intent ?? "—"}`,
    `тип житла: ${p.propertyType ?? "—"}`,
    `район: ${p.anyDistrict ? "будь-який" : p.district ?? "—"}`,
    `спальні: ${p.bedrooms ?? "—"}`,
    `бюджет max USD: ${p.budgetMaxUsd ?? "—"}`,
    `формат зустрічі: ${p.meetingType ? meetingLabel(p.meetingType, "uk") : "—"}`,
    `час: ${p.preferredSlotLabel ?? "—"}`,
    `ім'я: ${p.name ?? "—"}`,
    `телефон: ${p.phone ? "є (не повторюй повністю)" : "—"}`,
    `статус запису: ${bookingLine}`,
    `фокус slug: ${session.focusSlug ?? "—"}`,
    `останні пропозиції: ${session.lastMatchedSlugs.slice(0, 3).join(", ") || "—"}`,
  ];

  return lines.join("\n");
}

function bookingFieldLabel(
  field: NonNullable<ReturnType<typeof nextBookingField>>,
  prefs: UserPreferences,
) {
  switch (field) {
    case "meeting":
      return "формат (онлайн / телефон / офіс)";
    case "slot":
      return prefs.meetingType === "discuss"
        ? "зручний час дзвінка"
        : "слот зі списку";
    case "name":
      return "ім'я";
    case "phone":
      return "телефон";
  }
}
