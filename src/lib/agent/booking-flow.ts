import { site } from "@/lib/site";
import {
  DEFAULT_OFFER_COUNT,
  formatSlotsForPrompt,
  getKyivNow,
  getUpcomingSlots,
  matchSlotChoice,
  slotToOffered,
  type AgencySlot,
} from "@/lib/agent/schedule";
import { meetingOptions } from "@/lib/agent/meeting";
import type {
  AgentLang,
  MeetingType,
  OfferedSlot,
  UserPreferences,
} from "@/types/agent";

export type BookingField = "meeting" | "slot" | "name" | "phone";

export const FALSE_BOOKING_CLAIM =
  /заявку надіслано|заявку отправлено|заявку прийнято|заявку принят|забронюва|заброниров|зафіксува|зафиксир|записав(а|и)?(\s+вас)?|записала(\s+вас)?|запис закріп|вас записан|ти записан|менеджер\s+(скоро\s+)?(за)?телефон|менеджер\s+перезвон|переда(ю|в|ла|мо|ли|є).{0,60}(брокер|менеджер|адмін|команд)|зібрав.{0,40}дан|собрал.{0,40}дан|усі\s+ваші\s+дані|все\s+ваши\s+данные|готово\.?\s*заявк|перен[еі]с(ли|имо|ла|ти)?\s+(запис|зустріч|встречу)|онов(ив|ила|лено)\s+запис|очікуйте.{0,50}(дзвінок|звонок|дзвінка)|ожидайте.{0,50}(звонок|дзвінок)|брокер\s+підготує|ми\s+(вам\s+)?(скоро\s+)?(за)?телефон|зателефонуємо|перетелефонуємо|call\s+you\s+(soon|shortly)|booking\s+(is\s+)?confirm|request\s+(has\s+been\s+)?sent|passing.{0,40}(broker|team)|gathered.{0,40}(data|details)|оформ(ила|лено|ив)\s+(запис|заявк)/i;

export const RESCHEDULE_RE =
  /замін|замен|перенес|змінити\s*(запис|час|слот|зустріч)?|изменить\s*(запись|время|слот|встречу)?|переписат|інш(ий|е)\s*(час|слот|вікно)|друг(ой|ое)\s*(время|слот)|хочу\s+(на\s+)?(завтра|сьогодн|сегодня)|change\s+(the\s+)?(time|slot|meeting)|reschedule/i;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function addDays(
  year: number,
  month: number,
  day: number,
  add: number,
) {
  const utc = new Date(Date.UTC(year, month - 1, day + add));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function isPhoneDiscuss(prefs: UserPreferences) {
  return prefs.meetingType === "discuss";
}

export function detectLang(text: string, current?: AgentLang): AgentLang {
  const lower = text.toLowerCase();
  const letters = lower.replace(/[^a-zа-яіїєґ]/gi, "");
  if (letters.length < 3) return current ?? "uk";

  const latin = (letters.match(/[a-z]/gi) || []).length;
  const cyrillic = (letters.match(/[а-яіїєґ]/gi) || []).length;
  const enHints =
    (
      lower.match(
        /\b(the|and|for|with|apartment|house|budget|looking|need|want|please|hello|hi|meeting|call|office)\b/g,
      ) || []
    ).length;

  if (latin > cyrillic * 1.2 && (enHints > 0 || latin >= 8)) {
    return "en";
  }
  if (cyrillic >= latin) {
    return "uk";
  }
  return current ?? "uk";
}

export function extractMeetingType(text: string): MeetingType | undefined {
  const lower = text.toLowerCase();

  if (
    /(?:яка|какой|какая|де|где|що\s+за|какой\s+у\s+вас|какая\s+у\s+вас).{0,40}(?:адрес|офіс|офис)|(?:адрес|офіс|офис).{0,20}\?|годин[аи]\s+робот|график\s+работ|часы\s+работ|телефон\s+(?:офіс|офис|компані)/i.test(
      lower,
    )
  ) {
    return undefined;
  }

  if (
    /приїхат|приехать|в\s+офіс|в\s+офис|візит\s+в\s+офіс|визит\s+в\s+офис|зустріч\s+в\s+офіс|встреча\s+в\s+офис|хочу\s+(?:в\s+)?офіс|хочу\s+(?:в\s+)?офис|васильківськ|васильковск|office\s+visit|come\s+to\s+(the\s+)?office/.test(
      lower,
    )
  ) {
    return "office";
  }
  if (
    /онлайн|online|zoom|meet|відео|видео|созвон|video\s*call/.test(lower)
  ) {
    return "online";
  }
  if (
    /обговорити|обсудить|по\s+телефон|телефоном|телефонн|передзвон|перезвон|поговорити|поговорить|короткий\s+дзвінок|короткий\s+звонок|phone\s+call|by\s+phone|call\s+me/.test(
      lower,
    )
  ) {
    return "discuss";
  }
  return undefined;
}

export function nextBookingField(prefs: UserPreferences): BookingField | null {
  if (!prefs.meetingType) return "meeting";
  if (!prefs.preferredSlotLabel || !prefs.preferredDate || !prefs.preferredTime) {
    return "slot";
  }
  if (!prefs.name?.trim()) return "name";
  if (!prefs.phone?.trim()) return "phone";
  return null;
}

export function canSubmitBooking(prefs: UserPreferences) {
  return nextBookingField(prefs) === null;
}

export function ensureOfferedSlots(
  prefs: UserPreferences,
  lang: AgentLang = "uk",
): { prefs: UserPreferences; slots: AgencySlot[] } {
  if (isPhoneDiscuss(prefs)) {
    return { prefs, slots: [] };
  }

  const fresh = getUpcomingSlots({ count: DEFAULT_OFFER_COUNT });
  if (prefs.offeredSlots?.length) {
    const mapped = fresh.filter((s) =>
      prefs.offeredSlots!.some((o) => o.id === s.id),
    );
    const slots = mapped.length ? mapped : fresh;
    return {
      prefs: {
        ...prefs,
        offeredSlots: slots.map((s) => slotToOffered(s, lang)),
      },
      slots,
    };
  }

  return {
    prefs: {
      ...prefs,
      offeredSlots: fresh.map((s) => slotToOffered(s, lang)),
    },
    slots: fresh,
  };
}

export function applySlot(
  prefs: UserPreferences,
  slot: AgencySlot,
  lang: AgentLang,
): UserPreferences {
  return {
    ...prefs,
    preferredSlotId: slot.id,
    preferredDate: slot.dateISO,
    preferredTime: slot.time,
    preferredSlotLabel: lang === "en" ? slot.labelEn : slot.labelUk,
  };
}

/** Free-form callback window for phone discussions. */
export function parseFlexibleCallTime(
  message: string,
  lang: AgentLang = "uk",
): { dateISO: string; time: string; label: string } | null {
  const trimmed = message.trim().toLowerCase();
  if (trimmed.length < 2) return null;

  // Ignore pure yes / name-like answers during phone timing.
  if (
    /^(так|да|добре|хорошо|ок|okay|yes|угу|ага|запис(уйте|ати)?)$/i.test(
      trimmed,
    )
  ) {
    return null;
  }

  const now = getKyivNow();
  let dayOffset = 0;

  if (/післязавтра|послезавтра|day\s+after\s+tomorrow/.test(trimmed)) {
    dayOffset = 2;
  } else if (/завтра|tomorrow/.test(trimmed)) {
    dayOffset = 1;
  } else if (/сьогодн|сегодня|today/.test(trimmed)) {
    dayOffset = 0;
  } else if (
    !/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/.test(trimmed) &&
    !/(після\s+обід|после\s+обед|after\s+lunch|ввечер|вечор|evening|вранц|утр|morning|обід|обед)/.test(
      trimmed,
    )
  ) {
    // No clear timing signal.
    if (!/\b([01]?\d|2[0-3])\s*(?:год|годин|h|:)/.test(trimmed)) {
      return null;
    }
  }

  let hour: number | null = null;
  let minute = 0;

  const hm = trimmed.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (hm) {
    hour = Number(hm[1]);
    minute = Number(hm[2]);
  } else {
    const hourOnly = trimmed.match(
      /\b(?:о|в|at|на)?\s*([01]?\d|2[0-3])\s*(?:год(?:ина|ину|и|ин)?|:|h)?\b/,
    );
    if (hourOnly) {
      hour = Number(hourOnly[1]);
    } else if (/після\s+обід|после\s+обед|after\s+lunch|обід|обед/.test(trimmed)) {
      hour = 15;
    } else if (/ввечер|вечор|evening|після\s+18|после\s+18/.test(trimmed)) {
      hour = 18;
    } else if (/вранц|утр|morning|до\s+обід/.test(trimmed)) {
      hour = 11;
    }
  }

  if (hour == null || hour > 23) return null;

  // If "today" but time already passed — shift to tomorrow.
  if (
    dayOffset === 0 &&
    (hour < now.hour || (hour === now.hour && minute <= now.minute))
  ) {
    dayOffset = 1;
  }

  // Outside working hints: clamp to 10–19 casually for labels only.
  if (hour < 9) hour = 10;
  if (hour > 20) hour = 19;

  const day = addDays(now.year, now.month, now.day, dayOffset);
  const dateISO = `${day.year}-${pad(day.month)}-${pad(day.day)}`;
  const time = `${pad(hour)}:${pad(minute)}`;

  const dayWord =
    dayOffset === 0
      ? lang === "en"
        ? "today"
        : "сьогодні"
      : dayOffset === 1
        ? lang === "en"
          ? "tomorrow"
          : "завтра"
        : lang === "en"
          ? `${pad(day.day)}.${pad(day.month)}`
          : `${pad(day.day)}.${pad(day.month)}`;

  const label =
    lang === "en"
      ? `${dayWord} around ${time}`
      : `${dayWord} близько ${time}`;

  return { dateISO, time, label };
}

export function tryApplyCallWindow(
  prefs: UserPreferences,
  message: string,
  lang: AgentLang,
): UserPreferences {
  if (!isPhoneDiscuss(prefs)) return prefs;
  if (prefs.preferredSlotLabel && prefs.preferredDate && prefs.preferredTime) {
    return prefs;
  }

  const parsed = parseFlexibleCallTime(message, lang);
  if (!parsed) return prefs;

  return {
    ...prefs,
    preferredSlotId: `call:${parsed.dateISO}T${parsed.time}`,
    preferredDate: parsed.dateISO,
    preferredTime: parsed.time,
    preferredSlotLabel: parsed.label,
    offeredSlots: undefined,
  };
}

export function tryApplySlotFromMessage(
  prefs: UserPreferences,
  message: string,
  lang: AgentLang,
): UserPreferences {
  // Never bind schedule slots outside an active booking — bare "2" is often bedrooms.
  if (prefs.bookingStatus !== "collecting" || !prefs.meetingType) {
    return prefs;
  }

  if (isPhoneDiscuss(prefs)) {
    return tryApplyCallWindow(prefs, message, lang);
  }

  const field = nextBookingField(prefs);
  if (field !== "slot") {
    return prefs;
  }

  const { prefs: withSlots, slots } = ensureOfferedSlots(prefs, lang);
  const wider = getUpcomingSlots({ count: DEFAULT_OFFER_COUNT + 4 });
  const pool = [...slots];
  for (const slot of wider) {
    if (!pool.some((s) => s.id === slot.id)) pool.push(slot);
  }
  const matched = matchSlotChoice(message, pool);
  if (!matched) return withSlots;
  return applySlot(withSlots, matched, lang);
}

export function bookingPrompt(
  field: BookingField,
  prefs: UserPreferences,
  lang: AgentLang = "uk",
): string {
  if (lang === "en") {
    switch (field) {
      case "meeting":
        return `What works better: an online call, a short phone discussion, or an office visit (${site.streetAddress})?`;
      case "name":
        return "How should I address you?";
      case "phone":
        return "Please share your phone number and I will submit the request right away.";
      case "slot": {
        if (isPhoneDiscuss(prefs)) {
          return "What time is convenient for us to call you? For example today after lunch, or name an exact hour.";
        }
        const { slots } = ensureOfferedSlots(prefs, "en");
        const officeNote =
          prefs.meetingType === "office"
            ? `\nOffice: ${site.address}.`
            : prefs.meetingType === "online"
              ? "\nWe will send the Meet/Zoom link after confirmation."
              : "";
        return `Available windows are limited. Pick a time by number or clock time:\n${formatSlotsForPrompt(slots, "en")}${officeNote}`;
      }
    }
  }

  switch (field) {
    case "meeting":
      return `Як зручніше продовжити: онлайн-дзвінок, обговорити по телефону чи приїхати в офіс (${site.streetAddress})?`;
    case "name":
      return "Як до вас звертатися?";
    case "phone":
      return "Напишіть, будь ласка, номер телефону — і я одразу надішлю заявку.";
    case "slot": {
      if (isPhoneDiscuss(prefs)) {
        return "О котрій годині вам зручно, щоб ми зателефонували? Наприклад сьогодні після обіду або назвіть точний час.";
      }
      const { slots } = ensureOfferedSlots(prefs, "uk");
      const officeNote =
        prefs.meetingType === "office"
          ? `\nОфіс: ${site.address}.`
          : prefs.meetingType === "online"
            ? "\nПосилання на Meet/Zoom надішлемо після підтвердження."
            : "";
      return `Вільних вікон небагато. Оберіть час — номер або годину:\n${formatSlotsForPrompt(slots, "uk")}${officeNote}`;
    }
  }
}

export function meetingQuickReplies(lang: AgentLang) {
  return meetingOptions.map((option) => ({
    label: lang === "en" ? option.labelEn : option.labelUk,
    message: lang === "en" ? option.messageEn : option.messageUk,
  }));
}

export function slotQuickReplies(slots: OfferedSlot[]) {
  return slots.map((slot, index) => ({
    label: `${index + 1}. ${slot.label}`,
    message: slot.label,
  }));
}

export function isAffirmativeYes(message: string): boolean {
  const t = message.trim().toLowerCase().replace(/[!?.…]+$/g, "");
  return /^(так|да|давайте|добре|хорошо|ок|okay|yes|угу|ага|записуйте|запишіть|запишите|готово|згоден|згодна|согласен|согласна|можно|можна)$/i.test(
    t,
  );
}

export function isBookingReadySignal(
  message: string,
  lastAssistantText?: string,
): boolean {
  const trimmed = message.trim();
  if (/^як записат|^как записат|^did you (book|save)|^ти записав/i.test(trimmed)) {
    return false;
  }

  if (
    /хочу записат|запишіть|запишите|хочу\s+(онлайн|дзвінок|звонок|зустріч|встречу|офіс|офис|обговорити|обсудить)|давайте запис|можна мене записа|можно меня записа|готовий записат|готова записат|записатись|записаться|запиши мене|давайте запишемо|консультац|менеджер|передзвон|перезвон|book\s+a\s+(call|meeting)|schedule\s+a/i.test(
      trimmed,
    )
  ) {
    return true;
  }

  if (
    extractMeetingType(trimmed) &&
    lastAssistantText &&
    /онлайн|дзвінок|звонок|офіс|офис|обговорити|обсудить|зустріч|встречу|phone|office|call/i.test(
      lastAssistantText,
    )
  ) {
    return true;
  }

  if (
    isAffirmativeYes(trimmed) &&
    lastAssistantText &&
    /запис|консультац|зустріч|встречу|онлайн|дзвінок|звонок|офіс|офис|обговорити|обсудить|call|meeting/i.test(
      lastAssistantText,
    )
  ) {
    return true;
  }

  return false;
}

/** Replace hallucinated booking success with the next human booking step. */
export function scrubFalseBookingClaims(
  text: string,
  lang: AgentLang,
  prefs?: UserPreferences,
) {
  if (!FALSE_BOOKING_CLAIM.test(text)) return text;

  if (prefs && prefs.bookingStatus !== "submitted") {
    const field = nextBookingField(prefs);
    if (field) {
      return bookingPrompt(field, prefs, lang);
    }
    // All fields are present — persist happens in runAgent; do not invent success or re-ask.
    return lang === "en"
      ? "One moment — submitting your request now."
      : "Хвилинку — зараз надсилаю заявку.";
  }

  return lang === "en"
    ? "I still need a couple of details to finish the booking. What time is convenient for a call, and your name with phone number?"
    : "Щоб завершити запис, потрібні ще кілька деталей. Напишіть зручний час для дзвінка, ім'я та номер телефону.";
}

/** Last assistant asked for call time + name + phone in one go → treat as phone discuss. */
export function assistantImpliedPhoneDiscuss(lastAssistant?: string) {
  if (!lastAssistant) return false;
  return /час для дзвінка|time for (a )?call|ім'?я та номер|имя и номер|name (and|with) phone|зручний час.{0,40}(ім'?я|телефон)|convenient time.{0,40}(name|phone)/i.test(
    lastAssistant,
  );
}
