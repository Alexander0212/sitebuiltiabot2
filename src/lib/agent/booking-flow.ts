import { site } from "@/lib/site";
import {
  DEFAULT_OFFER_COUNT,
  formatSlotsForPrompt,
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
  /заявку надіслано|заявку отправлено|заявку прийнято|заявку принят|забронюва|заброниров|зафіксува|зафиксир|записав(а|и)?\s+ваш|запис закріп|менеджер\s+(скоро\s+)?(за)?телефон|менеджер\s+перезвон|переда(в|ла|мо|ли).{0,40}(менеджер|адмін)|готово\.?\s*заявк|перен[еі]с(ли|имо|ла|ти)?\s+(запис|зустріч|встречу)|онов(ив|ила|лено)\s+запис/i;

export const RESCHEDULE_RE =
  /замін|замен|перенес|змінити\s*(запис|час|слот|зустріч)?|изменить\s*(запись|время|слот|встречу)?|переписат|інш(ий|е)\s*(час|слот|вікно)|друг(ой|ое)\s*(время|слот)|хочу\s+(на\s+)?(завтра|сьогодн|сегодня)/i;

export function detectLang(text: string, current?: AgentLang): AgentLang {
  const lower = text.toLowerCase();
  const ruMarks =
    (lower.match(/[ыэъё]|что|это|нужен|нужна|квартир|позвон|встреч|сегодня|можно|давайте/g) ||
      []).length;
  const ukMarks =
    (lower.match(/[іїєґ]|що|потріб|квартир|передзвон|зустріч|сьогодні|можна|давайте/g) ||
      []).length;

  if (ruMarks > ukMarks + 1) return "ru";
  if (ukMarks > ruMarks) return "uk";
  return current ?? "uk";
}

export function extractMeetingType(text: string): MeetingType | undefined {
  const lower = text.toLowerCase();

  // Questions about office address / hours are not a booking format choice.
  if (
    /(?:яка|какой|какая|де|где|що\s+за|какой\s+у\s+вас|какая\s+у\s+вас).{0,40}(?:адрес|офіс|офис)|(?:адрес|офіс|офис).{0,20}\?|годин[аи]\s+робот|график\s+работ|часы\s+работ|телефон\s+(?:офіс|офис|компані)/i.test(
      lower,
    )
  ) {
    return undefined;
  }

  if (
    /приїхат|приехать|в\s+офіс|в\s+офис|візит\s+в\s+офіс|визит\s+в\s+офис|зустріч\s+в\s+офіс|встреча\s+в\s+офис|хочу\s+(?:в\s+)?офіс|хочу\s+(?:в\s+)?офис|васильківськ|васильковск/.test(
      lower,
    )
  ) {
    return "office";
  }
  if (/онлайн|online|zoom|meet|відео|видео|созвон/.test(lower)) {
    return "online";
  }
  if (
    /обговорити|обсудить|телефонн|передзвон|перезвон|поговорити|поговорить|короткий\s+дзвінок|короткий\s+звонок/.test(
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
    preferredSlotLabel: lang === "ru" ? slot.labelRu : slot.labelUk,
  };
}

export function tryApplySlotFromMessage(
  prefs: UserPreferences,
  message: string,
  lang: AgentLang,
): UserPreferences {
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
  if (lang === "ru") {
    switch (field) {
      case "meeting":
        return `Как удобнее продолжить: онлайн-звонок, обсудить по телефону или приехать в офис (${site.streetAddress})?`;
      case "name":
        return "Как к вам обращаться?";
      case "phone":
        return "Напишите, пожалуйста, номер телефона — и я сразу отправлю заявку.";
      case "slot": {
        const { slots } = ensureOfferedSlots(prefs, "ru");
        const officeNote =
          prefs.meetingType === "office"
            ? `\nОфис: ${site.address}.`
            : prefs.meetingType === "online"
              ? "\nСсылку на Meet/Zoom пришлём после подтверждения."
              : "";
        return `Свободных окон немного. Выберите слот — номер или время:\n${formatSlotsForPrompt(slots, "ru")}${officeNote}`;
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
      const { slots } = ensureOfferedSlots(prefs, "uk");
      const officeNote =
        prefs.meetingType === "office"
          ? `\nОфіс: ${site.address}.`
          : prefs.meetingType === "online"
            ? "\nПосилання на Meet/Zoom надішлемо після підтвердження."
            : "";
      return `Вільних вікон небагато. Оберіть слот — номер або час:\n${formatSlotsForPrompt(slots, "uk")}${officeNote}`;
    }
  }
}

export function meetingQuickReplies(lang: AgentLang) {
  return meetingOptions.map((option) => ({
    label: lang === "ru" ? option.labelRu : option.labelUk,
    message: lang === "ru" ? option.messageRu : option.messageUk,
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
  if (/^як записат|^как записат/i.test(trimmed)) return false;

  if (
    /хочу записат|запишіть|запишите|хочу\s+(онлайн|дзвінок|звонок|зустріч|встречу|офіс|офис|обговорити|обсудить)|давайте запис|можна мене записа|можно меня записа|готовий записат|готова записат|записатись|записаться|запиши мене|давайте запишемо|консультац|менеджер|передзвон|перезвон/i.test(
      trimmed,
    )
  ) {
    return true;
  }

  if (
    extractMeetingType(trimmed) &&
    lastAssistantText &&
    /онлайн|дзвінок|звонок|офіс|офис|обговорити|обсудить|зустріч|встречу/i.test(
      lastAssistantText,
    )
  ) {
    return true;
  }

  if (
    isAffirmativeYes(trimmed) &&
    lastAssistantText &&
    /запис|консультац|зустріч|встречу|онлайн|дзвінок|звонок|офіс|офис|обговорити|обсудить/i.test(
      lastAssistantText,
    )
  ) {
    return true;
  }

  return false;
}

export function scrubFalseBookingClaims(text: string, lang: AgentLang) {
  if (!FALSE_BOOKING_CLAIM.test(text)) return text;
  return lang === "ru"
    ? "Чтобы зафиксировать встречу, нужно подтверждение на сервере. Давайте сначала уточним формат и слот."
    : "Щоб зафіксувати зустріч, потрібне підтвердження на сервері. Давайте спочатку уточнимо формат і слот.";
}
