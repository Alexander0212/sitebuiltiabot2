import { districts } from "@/lib/site";
import { normalizeUaPhone, isValidUaPhone } from "@/lib/agent/phone";
import {
  detectLang,
  extractMeetingType,
} from "@/lib/agent/booking-flow";
import type { UserPreferences } from "@/types/agent";

const DISTRICT_ALIASES: Record<string, string> = {
  поділ: "Поділ",
  печерськ: "Печерськ",
  печерську: "Печерськ",
  оболонь: "Оболонь",
  оболоні: "Оболонь",
  центр: "Центр",
  голосіїв: "Голосіївський район",
  голосієво: "Голосіївський район",
  голосієві: "Голосіївський район",
  осокорки: "Осокорки",
  осокорках: "Осокорки",
};

export function extractPreferences(
  text: string,
  current: UserPreferences,
): UserPreferences {
  const next = { ...current };
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
    /(?:до|бюджет[уа]?|under|до\s*\$)\s*\$?\s*(\d[\d\s]{2,8})/i,
  );
  const usd = text.match(
    /\$\s*(\d[\d\s]{2,8})|(\d[\d\s]{4,8})\s*(?:\$|дол|usd)/i,
  );
  const raw = until?.[1] ?? usd?.[1] ?? usd?.[2];
  if (raw) {
    const value = Number(raw.replace(/\s/g, ""));
    if (value >= 30_000 && value <= 2_000_000) {
      next.budgetMaxUsd = value;
    }
  }

  if (/однокімнатн|однокомнатн|1\s*спальн|одну спальн|1\s*bed|one[-\s]?bed/.test(lower)) {
    next.bedrooms = 1;
  } else if (
    /двокімнатн|двухкомнатн|2\s*спальн|дві спальн|дві кімнат|2\s*bed|two[-\s]?bed/.test(
      lower,
    )
  ) {
    next.bedrooms = 2;
  } else if (
    /трикімнатн|трехкомнатн|трикімнатн|3\s*спальн|три спальн|3\s*bed|three[-\s]?bed/.test(
      lower,
    )
  ) {
    next.bedrooms = 3;
  } else if (
    /чотирик|четырехкомнатн|4\s*спальн|чотири спальн|4\s*bed|four[-\s]?bed/.test(
      lower,
    )
  ) {
    next.bedrooms = 4;
  }

  const area = lower.match(/від\s*(\d{2,3})\s*м|от\s*(\d{2,3})\s*м/);
  if (area) {
    next.minAreaM2 = Number(area[1] ?? area[2]);
  }

  for (const [alias, district] of Object.entries(DISTRICT_ALIASES)) {
    if (lower.includes(alias)) {
      next.district = district;
      break;
    }
  }

  if (/інвест|инвест|під дохід|под доход|для доходу|для дохода/.test(lower)) {
    next.goal = "invest";
  } else if (/дітям|детям|дитині|ребенк/.test(lower)) {
    next.goal = "family";
  } else if (/переїзд|переезд/.test(lower)) {
    next.goal = "relocate";
  } else if (/для життя|для жизни|жити|жить|сім'?ї|семьи|семей/.test(lower)) {
    next.goal = "live";
  }

  if (
    /район не важлив|район не важн|будь-який район|любой район|не має значення|не имеет значения/.test(
      lower,
    )
  ) {
    next.anyDistrict = true;
  }

  const phone = text.match(/(\+?380[\d\s()-]{8,14}|\b0\d{9}\b)/);
  if (phone) {
    const normalized = normalizeUaPhone(phone[1]);
    if (isValidUaPhone(normalized)) {
      next.phone = normalized;
    }
  }

  const name =
    text.match(/мене\s+звати\s+([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i) ||
    text.match(/меня\s+зовут\s+([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i) ||
    text.match(
      /(?:^|\n)\s*(?:я\s+)?([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})\s*[,.]?\s*(?:\+?380|0\d)/i,
    ) ||
    text.match(
      /(?:^|\n)\s*([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})\s*[.!,]\s+/u,
    ) ||
    text.match(
      /ім'?я\s*[:\-]?\s*([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i,
    ) ||
    text.match(
      /имя\s*[:\-]?\s*([A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30})/i,
    );

  if (name) {
    const candidate = name[1];
    if (
      !/^(так|да|добре|хорошо|ок|завтра|сьогодні|сегодня|дзвінок|звонок|офіс|офис|онлайн|яка|какой|какая|мене|меня)$/i.test(
        candidate,
      )
    ) {
      next.name = candidate;
    }
  } else if (
    current.bookingStatus === "collecting" &&
    !current.name &&
    /^[A-Za-zА-Яа-яЇїІіЄєҐґЁё'\-]{2,30}$/.test(text.trim())
  ) {
    next.name = text.trim();
  }

  return next;
}

export function mentionedUnknownDistrict(text: string) {
  const lower = text.toLowerCase();
  const extras = ["солом'янка", "нивки", "шулявка", "деміївка", "соломьянка"];
  return extras.find((name) => lower.includes(name));
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
  if (prefs.preferredSlotLabel) parts.push(prefs.preferredSlotLabel);
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
