import { site } from "@/lib/site";
import type { MeetingType } from "@/types/agent";

export const MEETING_TYPES = ["online", "discuss", "office"] as const;

export type MeetingOption = {
  value: MeetingType;
  labelUk: string;
  labelRu: string;
  hintUk: string;
  hintRu: string;
  messageUk: string;
  messageRu: string;
};

/** Three formats for both the chat agent and the site form. */
export const meetingOptions: MeetingOption[] = [
  {
    value: "online",
    labelUk: "Онлайн",
    labelRu: "Онлайн",
    hintUk: "Відеодзвінок (Google Meet / Zoom)",
    hintRu: "Видеозвонок (Google Meet / Zoom)",
    messageUk: "Хочу онлайн-дзвінок",
    messageRu: "Хочу онлайн-звонок",
  },
  {
    value: "discuss",
    labelUk: "Обговорити",
    labelRu: "Обсудить",
    hintUk: "Коротка телефонна розмова з менеджером",
    hintRu: "Короткий телефонный разговор с менеджером",
    messageUk: "Хочу обговорити по телефону",
    messageRu: "Хочу обсудить по телефону",
  },
  {
    value: "office",
    labelUk: "В офіс",
    labelRu: "В офис",
    hintUk: `Офіс: ${site.address}. ${site.hours}`,
    hintRu: `Офис: ${site.address}. ${site.hours}`,
    messageUk: `Хочу приїхати в офіс на ${site.streetAddress}`,
    messageRu: `Хочу приехать в офис на ${site.streetAddress}`,
  },
];

export function meetingLabel(
  type: MeetingType | undefined,
  lang: "uk" | "ru" = "uk",
) {
  const option = meetingOptions.find((item) => item.value === type);
  if (!option) {
    return lang === "ru" ? "встреча" : "зустріч";
  }
  if (type === "online") {
    return lang === "ru" ? "онлайн-звонок" : "онлайн-дзвінок";
  }
  if (type === "discuss") {
    return lang === "ru" ? "обсуждение по телефону" : "обговорення по телефону";
  }
  return lang === "ru" ? "визит в офис" : "візит в офіс";
}

export function meetingServiceLabel(type: MeetingType | undefined) {
  if (!type) return "NOVA · підбір";
  return `NOVA · ${meetingLabel(type, "uk")}`;
}
