import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import {
  appendLeadToGoogleSheet,
  isGoogleSheetsConfigured,
  type LeadSource,
} from "@/lib/agent/google-sheets";
import { meetingLabel, meetingServiceLabel } from "@/lib/agent/meeting";
import { normalizeUaPhone } from "@/lib/agent/phone";
import { notifyTelegram } from "@/lib/telegram";
import type { MeetingType } from "@/types/agent";

export type LeadEntry = {
  at: string;
  source: LeadSource;
  name: string;
  phone: string;
  meetingType?: MeetingType;
  date?: string;
  time?: string;
  slotLabel?: string;
  intent?: string;
  propertyType?: string;
  district?: string;
  budget?: string;
  goal?: string;
  notes?: string;
  summary?: string;
  lookingFor?: string;
  sessionId?: string;
};

export type PersistLeadResult = {
  ok: boolean;
  sheetOk: boolean;
  telegramOk: boolean;
  fileOk: boolean;
  messageUk: string;
  messageEn: string;
  error?: string;
};

function toSheetFields(entry: LeadEntry, phone: string) {
  const formatUk = meetingLabel(entry.meetingType, "uk");
  const service = meetingServiceLabel(entry.meetingType);

  const doctorParts = [
    entry.district ? `район: ${entry.district}` : null,
    entry.propertyType ? `тип: ${entry.propertyType}` : null,
    entry.goal ? `мета: ${entry.goal}` : null,
  ].filter(Boolean);

  const concernParts = [
    entry.summary,
    entry.lookingFor ? `запит: ${entry.lookingFor}` : null,
    entry.budget ? `бюджет: ${entry.budget}` : null,
    entry.intent ? `intent: ${entry.intent}` : null,
    entry.notes,
    entry.sessionId ? `session: ${entry.sessionId}` : null,
  ].filter(Boolean);

  return {
    source: entry.source,
    name: entry.name,
    phone,
    format: service,
    service,
    details: doctorParts.join(" · ") || "NOVA ESTATE",
    doctor: doctorParts.join(" · ") || "NOVA ESTATE",
    date: entry.date ?? null,
    time: entry.time ?? null,
    when: entry.slotLabel ?? null,
    slotLabel: entry.slotLabel ?? null,
    summary: concernParts.join(" | ") || `Заявка: ${formatUk}`,
    concern: concernParts.join(" | ") || `Заявка: ${formatUk}`,
    status: "new",
  };
}

export async function persistLead(
  entry: LeadEntry,
): Promise<PersistLeadResult> {
  const phone = normalizeUaPhone(entry.phone);
  const when = entry.slotLabel ? ` ${entry.slotLabel}` : "";
  const formatUk = meetingLabel(entry.meetingType, "uk");
  const formatEn = meetingLabel(entry.meetingType, "en");

  let fileOk = false;
  try {
    const dir = path.join(process.cwd(), "data", "agent-leads");
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, "leads.jsonl"),
      `${JSON.stringify({ ...entry, phone })}\n`,
      "utf8",
    );
    fileOk = true;
  } catch (error) {
    console.error("lead_file_failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
  }

  const sheet = await appendLeadToGoogleSheet(toSheetFields(entry, phone));

  let telegramOk = false;
  try {
    const tg = await notifyTelegram({
      title: "Нова заявка на зустріч",
      lines: [
        `Ім'я: ${entry.name}`,
        `Телефон: ${phone}`,
        entry.meetingType ? `Формат: ${formatUk}` : "",
        entry.slotLabel ? `Слот: ${entry.slotLabel}` : "",
        entry.summary ? `Резюме: ${entry.summary}` : "",
        `Джерело: ${entry.source}`,
        `Час: ${entry.at}`,
      ],
    });
    telegramOk = Boolean(tg.ok);
  } catch {
    telegramOk = false;
  }

  const sheetsConfigured = isGoogleSheetsConfigured();

  if (sheetsConfigured && !sheet.ok) {
    console.error("lead_sheets_failed", { error: sheet.error });
    return {
      ok: false,
      sheetOk: false,
      telegramOk,
      fileOk,
      messageUk:
        "Заявку не вдалося зберегти. Спробуйте ще раз або зателефонуйте нам.",
      messageEn:
        "We could not save the request. Please try again or call us.",
      error: sheet.error,
    };
  }

  if (!sheetsConfigured && !fileOk) {
    return {
      ok: false,
      sheetOk: false,
      telegramOk,
      fileOk: false,
      messageUk:
        "Заявку не вдалося зберегти. Спробуйте ще раз або зателефонуйте нам.",
      messageEn:
        "We could not save the request. Please try again or call us.",
      error: sheet.error || "persist_failed",
    };
  }

  return {
    ok: true,
    sheetOk: sheet.ok,
    telegramOk,
    fileOk,
    messageUk: `Готово. Заявку надіслано на${when}, формат: ${formatUk}. Ми скоро підтвердимо.`,
    messageEn: `Done. Request sent for${when}, format: ${formatEn}. We will confirm shortly.`,
  };
}
