/** Fixed agency schedule in Europe/Kyiv — sparse on purpose. */

export type AgencySlot = {
  id: string;
  dateISO: string;
  time: string;
  labelUk: string;
  labelRu: string;
  weekday: number;
};

const KYIV = "Europe/Kyiv";

const WEEKDAY_TIMES = ["11:00", "16:30", "18:00"] as const;
const SATURDAY_TIMES = ["10:00", "13:00"] as const;
const SUNDAY_TIMES = ["11:30"] as const;

const WEEKDAY_SHORT_UK = ["нд", "пн", "вт", "ср", "чт", "пт", "сб"] as const;
const WEEKDAY_SHORT_RU = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"] as const;

export const DEFAULT_OFFER_COUNT = 3;

function kyivParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: KYIV,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: weekdayMap[map.weekday ?? "Mon"] ?? 1,
  };
}

function timesForWeekday(weekday: number): readonly string[] {
  if (weekday === 0) return SUNDAY_TIMES;
  if (weekday === 6) return SATURDAY_TIMES;
  return WEEKDAY_TIMES;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function addCalendarDays(year: number, month: number, day: number, add: number) {
  const utc = new Date(Date.UTC(year, month - 1, day + add));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
    weekday: utc.getUTCDay(),
  };
}

function relativeDayLabel(
  offset: number,
  weekday: number,
  lang: "uk" | "ru",
) {
  if (offset === 0) return lang === "ru" ? "сегодня" : "сьогодні";
  if (offset === 1) return lang === "ru" ? "завтра" : "завтра";
  const list = lang === "ru" ? WEEKDAY_SHORT_RU : WEEKDAY_SHORT_UK;
  return list[weekday] ?? "";
}

function buildSlot(
  year: number,
  month: number,
  day: number,
  weekday: number,
  time: string,
  dayOffset: number,
): AgencySlot {
  const dateISO = `${year}-${pad(month)}-${pad(day)}`;
  const id = `${dateISO}T${time}`;
  const relUk = relativeDayLabel(dayOffset, weekday, "uk");
  const relRu = relativeDayLabel(dayOffset, weekday, "ru");
  return {
    id,
    dateISO,
    time,
    weekday,
    labelUk: `${relUk} ${pad(day)}.${pad(month)} о ${time}`,
    labelRu: `${relRu} ${pad(day)}.${pad(month)} в ${time}`,
  };
}

function isLikelyBooked(dateISO: string, time: string): boolean {
  let h = 0;
  const key = `${dateISO}|${time}`;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 33 + key.charCodeAt(i)) >>> 0;
  }
  return h % 100 < 55;
}

export function getUpcomingSlots(options?: {
  count?: number;
  from?: Date;
  horizonDays?: number;
}): AgencySlot[] {
  const count = options?.count ?? DEFAULT_OFFER_COUNT;
  const horizonDays = options?.horizonDays ?? 14;
  const now = options?.from ?? new Date();
  const parts = kyivParts(now);
  const nowMinutes = parts.hour * 60 + parts.minute;
  const out: AgencySlot[] = [];

  for (let offset = 0; offset < horizonDays && out.length < count; offset += 1) {
    const day = addCalendarDays(parts.year, parts.month, parts.day, offset);
    const times = timesForWeekday(day.weekday);
    let addedThisDay = 0;

    for (const time of times) {
      const [hh, mm] = time.split(":").map(Number);
      const slotMinutes = hh * 60 + mm;
      if (offset === 0 && slotMinutes <= nowMinutes + 90) continue;

      const dateISO = `${day.year}-${pad(day.month)}-${pad(day.day)}`;
      if (isLikelyBooked(dateISO, time)) continue;
      if (addedThisDay >= 1) continue;

      out.push(
        buildSlot(day.year, day.month, day.day, day.weekday, time, offset),
      );
      addedThisDay += 1;
      if (out.length >= count) break;
    }
  }

  return out;
}

export function formatSlotsForPrompt(
  slots: AgencySlot[],
  lang: "uk" | "ru" = "uk",
): string {
  if (!slots.length) {
    return lang === "ru"
      ? "На ближайшие дни почти всё занято. Могу предложить 2–3 окна чуть дальше."
      : "На найближчі дні майже все зайнято. Можу запропонувати 2–3 вікна трохи далі.";
  }
  return slots
    .map((s, i) => `${i + 1}) ${lang === "ru" ? s.labelRu : s.labelUk}`)
    .join("\n");
}

function preferDayHits(trimmed: string, hits: AgencySlot[]): AgencySlot | null {
  if (!hits.length) return null;
  if (hits.length === 1) return hits[0];
  if (trimmed.includes("завтра")) {
    return (
      hits.find((s) => s.labelUk.startsWith("завтра") || s.labelRu.startsWith("завтра")) ??
      null
    );
  }
  if (/сьогодн|сегодня/.test(trimmed)) {
    return (
      hits.find(
        (s) =>
          s.labelUk.startsWith("сьогодні") || s.labelRu.startsWith("сегодня"),
      ) ?? null
    );
  }
  return null;
}

export function matchSlotChoice(
  message: string,
  slots: AgencySlot[],
): AgencySlot | null {
  const trimmed = message.trim().toLowerCase();
  if (!slots.length) return null;

  const num = trimmed.match(/^(?:варіант|вариант\s*)?(\d{1,2})\s*[).:]?$/i);
  if (num) {
    const idx = Number(num[1]) - 1;
    if (idx >= 0 && idx < slots.length) return slots[idx];
  }

  const byId = slots.find((s) => trimmed.includes(s.id.toLowerCase()));
  if (byId) return byId;

  const hm = trimmed.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (hm) {
    const time = `${pad(Number(hm[1]))}:${hm[2]}`;
    const hits = slots.filter((s) => s.time === time);
    const picked = preferDayHits(trimmed, hits);
    if (picked) return picked;
    if (hits.length === 1) return hits[0];
  }

  const hourOnly =
    trimmed.match(
      /(?:завтра|сьогодн\w*|сегодня|післязавтра|послезавтра|на|о|в)\s+(?:о\s*|в\s*)?([01]?\d|2[0-3])\b(?!\s*[:.]\d)/i,
    ) ||
    trimmed.match(/\b([01]?\d|2[0-3])\s*(?:год(?:ина|ину|и|ин)?)\b/i);
  if (hourOnly) {
    const hour = pad(Number(hourOnly[1]));
    const exact = `${hour}:00`;
    let hits = slots.filter((s) => s.time === exact);
    if (!hits.length) {
      hits = slots.filter((s) => s.time.startsWith(`${hour}:`));
    }
    const picked = preferDayHits(trimmed, hits);
    if (picked) return picked;
    if (hits.length === 1) return hits[0];
  }

  for (const slot of slots) {
    if (trimmed.includes(slot.labelUk.toLowerCase())) return slot;
    if (trimmed.includes(slot.labelRu.toLowerCase())) return slot;
  }

  return null;
}

export function slotToOffered(slot: AgencySlot, lang: "uk" | "ru" = "uk") {
  return {
    id: slot.id,
    dateISO: slot.dateISO,
    time: slot.time,
    label: lang === "ru" ? slot.labelRu : slot.labelUk,
  };
}
