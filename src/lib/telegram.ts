type TelegramPayload = {
  title: string;
  lines: string[];
};

function formatMessage({ title, lines }: TelegramPayload) {
  return [`NOVA ESTATE · ${title}`, ...lines.filter(Boolean)].join("\n");
}

export async function notifyTelegram(payload: TelegramPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return { ok: false as const, skipped: true as const };
  }

  const text = formatMessage(payload).slice(0, 3900);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("telegram_notify_failed", {
        status: response.status,
        body: body.slice(0, 300),
      });
      return { ok: false as const, skipped: false as const };
    }

    return { ok: true as const, skipped: false as const };
  } catch (error) {
    console.error("telegram_notify_error", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return { ok: false as const, skipped: false as const };
  } finally {
    clearTimeout(timeout);
  }
}
