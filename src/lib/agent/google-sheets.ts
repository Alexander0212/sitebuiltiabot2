export type LeadSource = "chat" | "form" | "chat-inline";

/** Payload for Rag агенты sheet. Sends both new and legacy keys for Apps Script. */
export type SheetLeadPayload = {
  source: LeadSource;
  name: string;
  phone: string;
  /** Meeting format label (also sent as legacy `service`). */
  format?: string | null;
  service?: string | null;
  /** Goal / district / type notes (also sent as legacy `doctor`). */
  details?: string | null;
  doctor?: string | null;
  date?: string | null;
  time?: string | null;
  /** Human-readable when (also sent as legacy `slotLabel`). */
  when?: string | null;
  slotLabel?: string | null;
  /** Lead summary (also sent as legacy `concern`). */
  summary?: string | null;
  concern?: string | null;
  status?: string;
  sheetName?: string;
};

function webhookUrl() {
  return process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim() || "";
}

function webhookSecret() {
  return process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim() || "";
}

function targetSheetName() {
  return process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "Лист2";
}

export function isGoogleSheetsConfigured() {
  return webhookUrl().length > 8;
}

/**
 * Appends a booking row via Google Apps Script Web App.
 * See scripts/google-sheets-booking.gs → sheet Лист2
 */
export async function appendLeadToGoogleSheet(
  payload: SheetLeadPayload,
): Promise<{ ok: boolean; error?: string }> {
  const url = webhookUrl();
  if (!url) {
    return { ok: false, error: "GOOGLE_SHEETS_WEBHOOK_URL is not set" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret() || undefined,
        createdAt: new Date().toISOString(),
        timezone: "Europe/Kyiv",
        sheetName: payload.sheetName || targetSheetName(),
        source: payload.source,
        name: payload.name,
        phone: payload.phone,
        // New names
        format: payload.format ?? payload.service ?? "",
        details: payload.details ?? payload.doctor ?? "",
        when: payload.when ?? payload.slotLabel ?? "",
        summary: payload.summary ?? payload.concern ?? "",
        // Legacy aliases (older Apps Script deployments)
        service: payload.service ?? payload.format ?? "",
        doctor: payload.doctor ?? payload.details ?? "",
        slotLabel: payload.slotLabel ?? payload.when ?? "",
        concern: payload.concern ?? payload.summary ?? "",
        date: payload.date ?? "",
        time: payload.time ?? "",
        status: payload.status || "new",
      }),
      cache: "no-store",
    });

    const text = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        error: `Sheets HTTP ${response.status}: ${text.slice(0, 200)}`,
      };
    }

    try {
      const data = JSON.parse(text) as { ok?: boolean; error?: string };
      if (data.ok === false) {
        return { ok: false, error: data.error || "sheet_rejected" };
      }
    } catch {
      // Apps Script may return plain text
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "sheets_network_error",
    };
  }
}
