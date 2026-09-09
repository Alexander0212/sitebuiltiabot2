export type LeadSource = "chat" | "form" | "chat-inline";

/** Payload matches Rag агенты / Лист2 columns. */
export type SheetLeadPayload = {
  source: LeadSource;
  name: string;
  phone: string;
  service?: string | null;
  doctor?: string | null;
  date?: string | null;
  time?: string | null;
  slotLabel?: string | null;
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
        service: payload.service ?? "",
        doctor: payload.doctor ?? "",
        date: payload.date ?? "",
        time: payload.time ?? "",
        slotLabel: payload.slotLabel ?? "",
        concern: payload.concern ?? "",
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
