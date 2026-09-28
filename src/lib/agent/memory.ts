import { districts } from "@/lib/site";
import { normalizeUaPhone, isValidUaPhone } from "@/lib/agent/phone";
import {
  detectLang,
  extractMeetingType,
  parseFlexibleCallTime,
} from "@/lib/agent/booking-flow";
import type { AgentLang, UserPreferences } from "@/types/agent";

const DISTRICT_ALIASES: [string, string][] = [
  ["лівий берег", "Лівий берег"],
  ["лівому березі", "Лівий берег"],
  ["лівобереж", "Лівий берег"],
  ["голосіївськ", "Голосіївський район"],
  ["голосіїв", "Голосіївський район"],
  ["голосієв", "Голосіївський район"],
  ["конча-засп", "Конча-Заспа"],
  ["конча засп", "Конча-Заспа"],
  ["пуща-водиц", "Пуща-Водиця"],
  ["пуща водиц", "Пуща-Водиця"],
  ["віта-поштов", "Віта-Поштова"],
  ["віта поштов", "Віта-Поштова"],
  ["солом'ян", "Солом'янка"],
  ["соломян", "Солом'янка"],
  ["деміївк", "Деміївка"],
  ["печерськ", "Печерськ"],
  ["печерск", "Печерськ"],
  ["оболонь", "Оболонь"],
  ["осокорк", "Осокорки"],
  ["святошин", "Святошин"],
  ["шулявк", "Шулявка"],
  ["бортнич", "Бортничі"],
  ["подол", "Поділ"],
  ["поділ", "Поділ"],
  ["нивки", "Нивки"],
  ["гатне", "Гатне"],
  ["центр", "Центр"],
];

const DISTRICT_SUFFIX =
  /^(?:а|у|і|е|ю|я|ом|ем|ах|ях|ам|ям|ів|ов|ою|ею)?$/i;

function mentionsAlias(text: string, alias: string) {
  const lower = text.toLowerCase();
  let from = 0;
  while (from < lower.length) {
    const index = lower.indexOf(alias, from);
    if (index < 0) return false;
    const beforeOk =
      index === 0 || !/[a-zа-яіїєґ0-9']/i.test(lower[index - 1] ?? "");
    const rest = lower.slice(index + alias.length);
    const end = rest.search(/[^a-zа-яіїєґ']/i);
    const tail = end === -1 ? rest : rest.slice(0, end);
    if (beforeOk && DISTRICT_SUFFIX.test(tail)) return true;
    from = index + alias.length;
  }
  return false;
}

const NAME_STOP =
  /^(так|да|добре|хорошо|ок|okay|yes|завтра|сьогодні|сегодня|today|tomorrow|дзвінок|звонок|офіс|офис|онлайн|online|яка|какой|какая|мене|меня|після|после|обід|обед|годині|час|time)$/i;

function extractPhone(text: string) {
  const match = text.match(
    /(\+?380[\d\s()-]{8,14}|\b0\d{9}\b|\b\d{9}\b)/,
  );
  if (!match) return undefined;
  const normalized = normalizeUaPhone(match[1]);
  return isValidUaPhone(normalized) ? normalized : undefined;
}

function extractName(text: string, acceptBareName: boolean) {
  const beforePhone = text.match(
    /([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})\s*[,.]?\s*(?:\+?380\d{9}|0\d{9}|\d{9})\b/u,
  );
  const explicit =
    text.match(/мене\s+звати\s+([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i) ||
    text.match(/меня\s+зовут\s+([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i) ||
    text.match(/my\s+name\s+is\s+([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i) ||
    text.match(/ім'?я\s*[:\-]?\s*([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i) ||
    text.match(/имя\s*[:\-]?\s*([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i);

  const candidate = (explicit?.[1] || beforePhone?.[1] || "").trim();
  if (candidate && !NAME_STOP.test(candidate) && !/^\d/.test(candidate)) {
    return candidate;
  }

  const bare = text.trim();
  if (
    acceptBareName &&
    /^[A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30}$/u.test(bare) &&
    !NAME_STOP.test(bare)
  ) {
    return bare;
  }

  return undefined;
}

export function assistantAskedForName(lastAssistant?: string) {
  return /звертатися|як вас звати|ваше ім|your name|address you/i.test(
    lastAssistant || "",
  );
}

export function isReservedLabel(value?: string) {
  return Boolean(value && NAME_STOP.test(value.trim()));
}

/**
 * Pull phone / name / call-time from one chat message.
 * If contact details arrive without a format, default to phone discussion.
 */
export function ingestBookingDetails(
  text: string,
  current: UserPreferences,
  lang: AgentLang = "uk",
  acceptBareName = false,
): UserPreferences {
  const next = { ...current };
  const phone = extractPhone(text);
  if (phone) next.phone = phone;

  const name = extractName(text, acceptBareName);
  if (name) next.name = name;

  const hasContactSignal = Boolean(phone || name || /\b([01]?\d|2[0-3])[:.][0-5]\d\b/.test(text));
  if (
    !next.meetingType &&
    (current.bookingStatus === "collecting" || hasContactSignal) &&
    (phone || name)
  ) {
    // Chat users often dump details without choosing format — phone call is the lightest default.
    next.meetingType = "discuss";
  }

  if (
    next.meetingType === "discuss" &&
    (!next.preferredSlotLabel || !next.preferredDate || !next.preferredTime)
  ) {
    const parsed = parseFlexibleCallTime(text, lang);
    if (parsed) {
      next.preferredSlotId = `call:${parsed.dateISO}T${parsed.time}`;
      next.preferredDate = parsed.dateISO;
      next.preferredTime = parsed.time;
      next.preferredSlotLabel = parsed.label;
      next.offeredSlots = undefined;
    }
  }

  return next;
}

function extractBedrooms(
  text: string,
  current: UserPreferences,
): number | undefined {
  const lower = text.toLowerCase().trim();

  if (/однокімнатн|однокомнатн|1\s*спальн|одну спальн|1\s*bed|one[-\s]?bed/.test(lower)) {
    return 1;
  }
  if (
    /двокімнатн|двухкомнатн|2\s*спальн|дві спальн|дві кімнат|две комнат|2\s*bed|two[-\s]?bed/.test(
      lower,
    )
  ) {
    return 2;
  }
  if (
    /трикімнатн|трехкомнатн|3\s*спальн|три спальн|три кімнат|3\s*bed|three[-\s]?bed/.test(
      lower,
    )
  ) {
    return 3;
  }
  if (
    /чотирик|четырехкомнатн|4\s*спальн|чотири спальн|4\s*bed|four[-\s]?bed/.test(
      lower,
    )
  ) {
    return 4;
  }
  if (/5\s*спальн|п'?ять спальн|пять спальн|5\s*bed|five[-\s]?bed/.test(lower)) {
    return 5;
  }

  // Short answers while bedrooms still unknown: "2", "дві", "2 спальні".
  if (current.bedrooms == null) {
    const word: Record<string, number> = {
      "1": 1,
      одна: 1,
      одну: 1,
      один: 1,
      one: 1,
      "2": 2,
      дві: 2,
      две: 2,
      два: 2,
      двох: 2,
      two: 2,
      "3": 3,
      три: 3,
      three: 3,
      "4": 4,
      чотири: 4,
      четыре: 4,
      four: 4,
      "5": 5,
      "п'ять": 5,
      пять: 5,
      five: 5,
    };

    const short = lower
      .replace(/[.!?…]+$/g, "")
      .replace(/\s*(?:спальн\w*|bedrooms?|кімнат\w*|комнат\w*)\s*$/i, "")
      .trim();

    if (Object.prototype.hasOwnProperty.call(word, short)) {
      return word[short];
    }
  }

  return undefined;
}

export function extractPreferences(
  text: string,
  current: UserPreferences,
): UserPreferences {
  let next = { ...current };
  const lower = text.toLowerCase();

  next.lang = detectLang(text, current.lang);

  const meeting = extractMeetingType(text);
  if (meeting) {
    next.meetingType = meeting;
  }

  if (/купити|покупк|купить|покупк/i.test(lower)) {
    next.intent = "buy";
  } else if (/орендувати|оренда|снять|арендовать|аренда/i.test(lower)) {
    next.intent = "rent";
  } else if (/продати|продать/i.test(lower)) {
    next.intent = "sell";
  } else if (/здати|сдать\s+в\s+аренду/i.test(lower)) {
    next.intent = "lease";
  } else if (/консультац/i.test(lower)) {
    next.intent = next.intent ?? "consult";
  }

  if (/будинок|дом\b|коттедж|таунхаус/i.test(lower)) {
    next.propertyType = "house";
  } else if (/новобуд|новострой/i.test(lower)) {
    next.propertyType = "newbuild";
  } else if (/вторинк|вторичк/i.test(lower)) {
    next.propertyType = "secondary";
  } else if (/квартир/i.test(lower)) {
    next.propertyType = next.propertyType ?? "apartment";
  }

  const until = lower.match(
    /(?:до|бюджет[уа]?|under|around|about|до\s*\$)\s*\$?\s*(\d[\d\s]{2,8})/i,
  );
  const usd = text.match(
    /\$\s*(\d[\d\s]{2,8})|(\d[\d\s]{4,8})\s*(?:\$|дол|usd)/i,
  );
  const bareBudget =
    current.budgetMaxUsd == null
      ? text.trim().match(/^\$?\s*(\d[\d\s]{4,8})\s*(?:\$|дол|usd)?[.!?]*$/i)
      : null;
  const raw = until?.[1] ?? usd?.[1] ?? usd?.[2] ?? bareBudget?.[1];
  if (raw) {
    const value = Number(raw.replace(/\s/g, ""));
    if (value >= 30_000 && value <= 2_000_000) {
      next.budgetMaxUsd = value;
    }
  }

  const bedrooms = extractBedrooms(text, current);
  if (bedrooms != null) {
    next.bedrooms = bedrooms;
  }

  const area = lower.match(/від\s*(\d{2,3})\s*м|от\s*(\d{2,3})\s*м/);
  if (area) {
    next.minAreaM2 = Number(area[1] ?? area[2]);
  }

  for (const [alias, district] of DISTRICT_ALIASES) {
    if (mentionsAlias(lower, alias)) {
      next.district = district;
      next.anyDistrict = false;
      break;
    }
  }

  if (
    /інвест|инвест|під дохід|под доход|для доходу|для дохода|invest|rental\s+income|for\s+income/.test(
      lower,
    )
  ) {
    next.goal = "invest";
  } else if (/дітям|детям|дитині|ребенк|family|with\s+(a\s+)?kid|child/.test(lower)) {
    next.goal = "family";
  } else if (/переїзд|переезд|relocat/.test(lower)) {
    next.goal = "relocate";
  } else if (
    /для життя|для жизни|жити|жить|для себе|для себя|собі|себе|сім'?ї|семьи|семей|for\s+(myself|ourselves|living)|personal\s+use|to\s+live/.test(
      lower,
    )
  ) {
    next.goal = "live";
  }

  if (
    /район не важлив|район не важн|будь-який район|любой район|не має значення|не имеет значения/.test(
      lower,
    )
  ) {
    next.anyDistrict = true;
  }

  next = ingestBookingDetails(text, next, next.lang ?? "uk");

  return next;
}

export function districtNamedIn(text: string) {
  const lower = text.toLowerCase();
  for (const [alias, district] of DISTRICT_ALIASES) {
    if (mentionsAlias(lower, alias)) return district;
  }
  return undefined;
}

export function allKnownDistricts() {
  return districts;
}

export function preferenceSummary(prefs: UserPreferences) {
  const parts: string[] = [];
  if (prefs.intent) parts.push(prefs.intent);
  if (prefs.bedrooms) parts.push(`${prefs.bedrooms} спальні`);
  if (prefs.budgetMaxUsd) {
    parts.push(`до $${prefs.budgetMaxUsd.toLocaleString("uk-UA")}`);
  }
  if (prefs.district) parts.push(prefs.district);
  if (prefs.minAreaM2) parts.push(`від ${prefs.minAreaM2} м²`);
  if (prefs.goal) {
    const goalMap: Record<string, string> = {
      invest: "інвестиція",
      live: "для життя",
      family: "для сім'ї",
      relocate: "переїзд",
      other: "інше",
    };
    parts.push(goalMap[prefs.goal] ?? prefs.goal);
  }
  if (prefs.meetingType) parts.push(prefs.meetingType);
  // Do not echo preferredSlotLabel in catalog intros — looks like invented time.
  return parts.join(", ");
}

export function isHandoffIntent(text: string) {
  return /менеджер|людин[ау]|человек|оператор|передзвон|перезвон|заброн|запис\w*\s+на\s+(перегляд|підбір|консультац|просмотр|встречу|зустріч)|хочу\s+(купи|розмов|консультац|підбір|запис|звонок|дзвінок|встречу|зустріч|онлайн)|готовий\s+(купи|запис)|готовый\s+(купи|запис)|нотаріус|залиш(те|и)\s+телефон|оставьте\s+телефон|мій телефон|мой телефон|запишіть мене|запишите меня|давайте запишемо|давайте запишем|запишіть\s+на\s+|запишите\s+на\s+|давайте\s+на\s+зустріч|давайте\s+на\s+встречу/.test(
    text.toLowerCase(),
  );
}

/** Office address, hours, phone — answer immediately, do not open booking UI. */
export function isOfficeInfoQuestion(text: string) {
  const lower = text.toLowerCase();
  return /адрес|де\s+ви|где\s+вы|де\s+офіс|где\s+офис|ваш\s+офіс|ваш\s+офис|офіс\s+(агент|компані|nova)|офис\s+(агент|компани|nova)|яка\s+у\s+вас\s+адрес|какая\s+у\s+вас\s+адрес|годин[аи]\s+робот|график\s+работ|часы\s+работ|телефон\s+(?:офіс|офис|компані|агент)|як\s+вас\s+знайти|как\s+вас\s+найти|васильківськ|васильковск/.test(
    lower,
  );
}

/** Side question during booking — answer it, do not force the next booking prompt. */
export function isSideQuestionDuringBooking(text: string) {
  if (isOfficeInfoQuestion(text)) return true;
  const trimmed = text.trim();
  if (
    /[?？]/.test(trimmed) &&
    !/хочу\s+запис|запишіть|запишите|онлайн|обговорити|обсудить|в\s+офіс|в\s+офис/.test(
      trimmed.toLowerCase(),
    )
  ) {
    return true;
  }
  return /^(де|где|як|как|що|что|яка|какой|какая|скільки|сколько|коли|когда)\b/i.test(
    trimmed,
  );
}

export function isOutOfScopeIntent(text: string) {
  const lower = text.toLowerCase();

  if (
    /ваш\s+офіс|ваш\s+офис|офіс\s+(агент|компані|nova)|офис\s+(агент|компани|nova)|адреса\s+офіс|адрес\s+офис|де\s+офіс|где\s+офис|графік\s+робот|график\s+работ|години\s+робот|часы\s+работ/.test(
      lower,
    )
  ) {
    return false;
  }

  return /спортив|физкультур|фітнес|фитнес|тренажер|комерц|коммерц|під\s+офіс|под\s+офис|офісне\s+приміщен|офисное\s+помещен|шукаю\s+офіс|ищу\s+офис|орендувати\s+офіс|арендовать\s+офис|складське|под\s+склад|магазин|шоуроум|ресторан|кафе|салон\s+краси|салон\s+красоты|виробниц|производств|земельн\s*ділян|земельн\s*участ|(^|[^\p{L}])зал([^\p{L}]|$)/u.test(
    lower,
  );
}

export function isCompareIntent(text: string) {
  return /порівняй|порівняти|сравни|сравнить|різниця|разница|що кращ|что лучше/.test(
    text.toLowerCase(),
  );
}

export function isCheaperIntent(text: string) {
  return /дешев|дешевл|нижч(а|е) ціна|ниже\s+цена|менш(е|ий) бюджет|меньший бюджет|cheap/.test(
    text.toLowerCase(),
  );
}

export function isUpperFloorIntent(text: string) {
  return /верхн(ьому|ій)|верхн(ем|ий)|останн(ій|ьому) поверх|последн(ий|ем)\s+этаж/.test(
    text.toLowerCase(),
  );
}

export function unknownFactQuery(text: string) {
  const lower = text.toLowerCase();
  if (/балкон/.test(lower)) return "балкон";
  if (/паркінг|паркинг|парков|машиномісц|машиномест/.test(lower)) return "паркінг";
  if (/житлов(а|ої) площ|жилая\s+площад/.test(lower)) return "житлова площа";
  if (/координат|на карті|на карте|геолок/.test(lower)) return "координати";
  if (/ремонт|стан квартир|состояние\s+квартир/.test(lower)) return "стан ремонту";
  return null;
}
