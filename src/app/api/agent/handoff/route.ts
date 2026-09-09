import { persistLead } from "@/lib/agent/leads";
import { isValidUaPhone, normalizeUaPhone } from "@/lib/agent/phone";
import { handoffSummary } from "@/lib/agent/run";
import {
  getUpcomingSlots,
  matchSlotChoice,
} from "@/lib/agent/schedule";
import {
  appendMessage,
  getOrCreateSession,
  saveSession,
} from "@/lib/agent/session";
import { handoffSchema } from "@/lib/validations/agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некоректний запит" }, { status: 400 });
  }

  const parsed = handoffSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Перевірте дані" },
      { status: 400 },
    );
  }

  const phone = normalizeUaPhone(parsed.data.phone);
  if (!isValidUaPhone(phone)) {
    return Response.json({ error: "Перевірте формат номера" }, { status: 400 });
  }

  const session = await getOrCreateSession();
  const lang = session.preferences.lang ?? "uk";

  let date = parsed.data.date;
  let time = parsed.data.time;
  let slotLabel = parsed.data.slotLabel;
  let slotId = parsed.data.slotId;

  if ((!date || !time || !slotLabel) && (slotId || slotLabel)) {
    const slots = getUpcomingSlots({ count: 12 });
    const matched =
      slots.find((s) => s.id === slotId) ||
      matchSlotChoice(slotLabel ?? slotId ?? "", slots);
    if (matched) {
      date = matched.dateISO;
      time = matched.time;
      slotId = matched.id;
      slotLabel = lang === "ru" ? matched.labelRu : matched.labelUk;
    }
  }

  if (!date || !time || !slotLabel) {
    return Response.json(
      {
        error:
          lang === "ru"
            ? "Выберите слот встречи"
            : "Оберіть слот зустрічі",
      },
      { status: 400 },
    );
  }

  session.preferences.name = parsed.data.name;
  session.preferences.phone = phone;
  session.preferences.meetingType = parsed.data.meetingType;
  session.preferences.preferredSlotId = slotId;
  session.preferences.preferredDate = date;
  session.preferences.preferredTime = time;
  session.preferences.preferredSlotLabel = slotLabel;
  session.preferences.bookingStatus = "collecting";

  const summary = handoffSummary(session);
  const at = new Date().toISOString();

  const persisted = await persistLead({
    at,
    source: "chat",
    sessionId: session.id,
    name: parsed.data.name,
    phone,
    meetingType: parsed.data.meetingType,
    date,
    time,
    slotLabel,
    intent: session.preferences.intent,
    propertyType: session.preferences.propertyType,
    district: session.preferences.district,
    budget: session.preferences.budgetMaxUsd
      ? `до $${session.preferences.budgetMaxUsd}`
      : undefined,
    goal: session.preferences.goal,
    summary,
  });

  if (!persisted.ok) {
    session.preferences.bookingStatus = "error";
    await saveSession(session);
    return Response.json(
      {
        ok: false,
        error: lang === "ru" ? persisted.messageRu : persisted.messageUk,
      },
      { status: 502 },
    );
  }

  const text = lang === "ru" ? persisted.messageRu : persisted.messageUk;
  session.preferences.bookingStatus = "submitted";
  session.handoff = {
    requestedAt: at,
    summary,
    name: parsed.data.name,
    phone,
    meetingType: parsed.data.meetingType,
    slotLabel,
    date,
    time,
    sheetOk: persisted.sheetOk,
  };
  appendMessage(session, { role: "assistant", content: text });
  await saveSession(session);

  return Response.json({
    ok: true,
    text,
    summary,
    sheetOk: persisted.sheetOk,
  });
}
