import { site } from "@/lib/site";
import type { MeetingType } from "@/types/agent";

export const MEETING_TYPES = ["online", "discuss", "office"] as const;

export type MeetingOption = {
  value: MeetingType;
  labelUk: string;
  labelEn: string;
  hintUk: string;
  hintEn: string;
  messageUk: string;
  messageEn: string;
};

/** Three formats for both the chat agent and the site form. */
export const meetingOptions: MeetingOption[] = [
  {
    value: "online",
    labelUk: "Онлайн",
    labelEn: "Online",
    hintUk: "Відеодзвінок (Google Meet / Zoom)",
    hintEn: "Video call (Google Meet / Zoom)",
    messageUk: "Хочу онлайн-дзвінок",
    messageEn: "I want an online call",
  },
  {
    value: "discuss",
    labelUk: "Обговорити",
    labelEn: "Call",
    hintUk: "Коротка телефонна розмова з менеджером",
    hintEn: "Short phone call with a manager",
    messageUk: "Хочу обговорити по телефону",
    messageEn: "I want to discuss by phone",
  },
  {
    value: "office",
    labelUk: "В офіс",
    labelEn: "Office",
    hintUk: `Офіс: ${site.address}. ${site.hours}`,
    hintEn: `Office: ${site.address}. ${site.hours}`,
    messageUk: `Хочу приїхати в офіс на ${site.streetAddress}`,
    messageEn: `I want to visit the office at ${site.streetAddress}`,
  },
];

export function meetingLabel(
  type: MeetingType | undefined,
  lang: "uk" | "en" = "uk",
) {
  const option = meetingOptions.find((item) => item.value === type);
  if (!option) {
    return lang === "en" ? "meeting" : "зустріч";
  }
  if (type === "online") {
    return lang === "en" ? "online call" : "онлайн-дзвінок";
  }
  if (type === "discuss") {
    return lang === "en" ? "phone discussion" : "обговорення по телефону";
  }
  return lang === "en" ? "office visit" : "візит в офіс";
}

export function meetingServiceLabel(type: MeetingType | undefined) {
  if (!type) return "NOVA · підбір";
  return `NOVA · ${meetingLabel(type, "uk")}`;
}
