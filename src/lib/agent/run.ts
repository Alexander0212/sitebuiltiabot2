import { agentInstructions } from "@/content/agent/instructions";
import {
  cheaperThan,
  formatListingBrief,
  formatListingBlock,
  getCatalog,
  getListingBySlug,
  listingToSuggestion,
  searchListings,
} from "@/lib/agent/catalog";
import { formatKnowledgeBlock, retrieveKnowledge } from "@/lib/agent/knowledge";
import { completeChat, getLlmConfig } from "@/lib/agent/config-llm";
import { persistLead } from "@/lib/agent/leads";
import {
  applySlot,
  bookingPrompt,
  canSubmitBooking,
  ensureOfferedSlots,
  isBookingReadySignal,
  meetingQuickReplies,
  nextBookingField,
  RESCHEDULE_RE,
  scrubFalseBookingClaims,
  slotQuickReplies,
  tryApplySlotFromMessage,
} from "@/lib/agent/booking-flow";
import { getUpcomingSlots, matchSlotChoice } from "@/lib/agent/schedule";
import {
  extractPreferences,
  isCheaperIntent,
  isCompareIntent,
  isHandoffIntent,
  isOfficeInfoQuestion,
  isOutOfScopeIntent,
  isSideQuestionDuringBooking,
  isUpperFloorIntent,
  mentionedUnknownDistrict,
  preferenceSummary,
  unknownFactQuery,
} from "@/lib/agent/memory";
import {
  closingQuestion,
  compareListings,
  isShowCardsIntent,
  nextSlot,
  presentListings,
  qualifyQuestion,
  readyToMatch,
} from "@/lib/agent/script";
import { appendMessage, rememberView, saveSession } from "@/lib/agent/session";
import { formatUsdSymbol } from "@/lib/format";
import { site } from "@/lib/site";
import type { AgentReply, AgentSession } from "@/types/agent";
import type { CatalogListing as Listing } from "@/lib/agent/catalog";

async function saveBookingIfReady(
  session: AgentSession,
  source: "chat" | "chat-inline",
) {
  if (!canSubmitBooking(session.preferences)) {
    return null;
  }

  if (session.preferences.bookingStatus === "submitted" && session.handoff) {
    return null;
  }

  const name = session.preferences.name?.trim();
  const phone = session.preferences.phone?.trim();
  if (!name || !phone) {
    return null;
  }

  const summary = handoffSummary(session);
  const at = new Date().toISOString();
  const lang = session.preferences.lang ?? "uk";

  const persisted = await persistLead({
    at,
    source,
    sessionId: session.id,
    name,
    phone,
    meetingType: session.preferences.meetingType,
    date: session.preferences.preferredDate,
    time: session.preferences.preferredTime,
    slotLabel: session.preferences.preferredSlotLabel,
    intent: session.preferences.intent,
    propertyType: session.preferences.propertyType,
    district: session.preferences.district,
    budget: session.preferences.budgetMaxUsd
      ? `до $${session.preferences.budgetMaxUsd}`
      : undefined,
    goal: session.preferences.goal,
    notes: session.preferences.notes,
    summary,
  });

  if (!persisted.ok) {
    session.preferences.bookingStatus = "error";
    return persisted;
  }

  session.preferences.bookingStatus = "submitted";
  session.handoff = {
    requestedAt: at,
    summary,
    name,
    phone,
    meetingType: session.preferences.meetingType,
    slotLabel: session.preferences.preferredSlotLabel,
    date: session.preferences.preferredDate,
    time: session.preferences.preferredTime,
    sheetOk: persisted.sheetOk,
  };

  return {
    ...persisted,
    message: lang === "ru" ? persisted.messageRu : persisted.messageUk,
  };
}

function reply(
  text: string,
  listings: Listing[] = [],
  showCards = false,
  extra?: Partial<
    Pick<
      AgentReply,
      | "handoffRequested"
      | "needsContact"
      | "bookingStep"
      | "offeredSlots"
      | "quickReplies"
      | "source"
    >
  >,
): AgentReply {
  return {
    text,
    suggestions: listings.map(listingToSuggestion),
    showCards: showCards && listings.length > 0,
    quickReplies: extra?.quickReplies ?? [],
    handoffRequested: extra?.handoffRequested ?? false,
    needsContact: extra?.needsContact ?? false,
    bookingStep: extra?.bookingStep ?? null,
    offeredSlots: extra?.offeredSlots,
    source: extra?.source ?? "catalog",
  };
}

function matchMessage(
  listings: Listing[],
  prefs: AgentSession["preferences"],
  intro: string,
  showCards: boolean,
) {
  const slice = listings.slice(0, 2);
  const body = presentListings(slice);
  const closer = closingQuestion(prefs, slice.length);
  return reply(
    `${intro}\n\n${body}\n\n${closer}`,
    slice,
    showCards,
  );
}

function mentionedInText(text: string) {
  const lower = text.toLowerCase();
  return getCatalog().filter(
    (listing) =>
      lower.includes(listing.slug) ||
      lower.includes(listing.title.toLowerCase()) ||
      lower.includes(listing.headline.toLowerCase()),
  );
}

/** Ready to talk about specific apartments (text). */
function canDiscussListings(session: AgentSession, text: string) {
  if (readyToMatch(session.preferences)) {
    return true;
  }

  if (mentionedInText(text).length > 0) {
    return true;
  }

  return (
    session.lastMatchedSlugs.length > 0 &&
    (isCheaperIntent(text) ||
      isCompareIntent(text) ||
      isUpperFloorIntent(text) ||
      isShowCardsIntent(text) ||
      /покажи ще|ще варіант|інші адрес|наступн/.test(text.toLowerCase()))
  );
}

function resolveFocus(session: AgentSession, text: string) {
  const mentioned = mentionedInText(text);

  if (mentioned.length >= 1) {
    return mentioned[0];
  }

  if (session.focusSlug) {
    return getListingBySlug(session.focusSlug);
  }

  if (session.lastMatchedSlugs[0]) {
    return getListingBySlug(session.lastMatchedSlugs[0]);
  }

  return undefined;
}

function hasFeature(listing: Listing, fact: string) {
  if (fact === "балкон") {
    return listing.features.some((item) => /балкон|тераса/.test(item.toLowerCase()));
  }

  if (fact === "паркінг") {
    return listing.features.some((item) => /паркінг|парков/.test(item.toLowerCase()));
  }

  return false;
}

function catalogReply(
  session: AgentSession,
  text: string,
  showCards: boolean,
): AgentReply {
  const prefs = session.preferences;
  const summary = preferenceSummary(prefs);
  const extraDistrict = mentionedUnknownDistrict(text);
  const focus = resolveFocus(session, text);
  const fact = unknownFactQuery(text);
  const handoff = isHandoffIntent(text);
  const lower = text.toLowerCase();
  const slot = nextSlot(prefs);

  if (isOutOfScopeIntent(text)) {
    return reply(
      "Зрозуміла. Ми в NOVA працюємо з квартирами для життя і під дохід, не з комерційними залами чи приміщеннями. Якщо шукаєте житло або лот під оренду, можу допомогти. Що ближче вам?",
    );
  }

  if (handoff) {
    return reply(
      [
        "Добре, запишемо коротку консультацію в чаті.",
        summary ? `Вже відомо: ${summary}.` : null,
        "Напишіть, як зручніше: онлайн, обговорити по телефону чи приїхати в офіс. Далі оберемо час, ім'я і телефон — і я надішлю заявку.",
      ]
        .filter(Boolean)
        .join(" "),
      [],
      false,
      { handoffRequested: true, needsContact: false },
    );
  }

  if (extraDistrict) {
    return reply(
      `${extraDistrict} у географії пошуку є, але в публічній добірці окремої картки немає. Можу підібрати з Подолу, Печерська, Оболоні, Центру, Голосієва чи Осокорків, або передати менеджеру.`,
    );
  }

  if (fact && focus) {
    if (fact === "житлова площа" && focus.livingAreaM2 == null) {
      return reply(
        `Житлової площі для цієї адреси в базі немає. Загальна: ${focus.areaM2} м². Уточню в менеджера, якщо потрібно.`,
      );
    }

    if (fact === "координати" && focus.coordinates == null) {
      return reply(
        `Точної вулиці в базі немає. Район: ${focus.address}. Можу уточнити в менеджера.`,
      );
    }

    if (fact === "стан ремонту" && focus.condition == null) {
      return reply(
        "Стан ремонту в базі не зафіксований, тож не хочу вгадувати. Краще подивитись на перегляді.",
      );
    }

    if ((fact === "балкон" || fact === "паркінг") && !hasFeature(focus, fact)) {
      return reply(
        `Про ${fact} для цієї адреси в базі немає підтвердження. Можу уточнити в менеджера.`,
      );
    }

    if (fact === "балкон" && hasFeature(focus, fact)) {
      return reply(
        `Так, у характеристиках є: ${focus.features.filter((item) => /тераса|балкон/.test(item.toLowerCase())).join(", ")}.`,
      );
    }
  }

  if (/покажи ще|ще варіант|інші адрес|наступн/.test(lower)) {
    const seen = new Set(session.viewedSlugs);
    const more = searchListings(prefs)
      .filter((listing) => !seen.has(listing.slug))
      .slice(0, 2);

    if (more.length === 0) {
      return reply(
        "Інших адрес під цей запит у добірці зараз немає. Можу записати перегляд уже названих або передати менеджеру.",
      );
    }

    return matchMessage(
      more,
      prefs,
      summary ? `Ще варіанти з урахуванням: ${summary}.` : "Ще з добірки.",
      showCards,
    );
  }

  if (isCompareIntent(text)) {
    const listings = session.lastMatchedSlugs
      .slice(0, 2)
      .map((slug) => getListingBySlug(slug))
      .filter((item): item is Listing => Boolean(item));

    if (listings.length < 2) {
      const fallback = searchListings(prefs).slice(0, 2);
      return matchMessage(
        fallback,
        prefs,
        "Щоб порівняти, візьмемо два найближчі з добірки.",
        showCards,
      );
    }

    return reply(
      `${compareListings(listings)}\n\nЯка ближче, чи записати перегляд?`,
      listings,
      showCards,
    );
  }

  if (isCheaperIntent(text)) {
    const from = focus ?? getListingBySlug(session.lastMatchedSlugs[0] ?? "");
    const cheaper = from
      ? cheaperThan(from.slug, prefs)
      : searchListings(prefs).sort((a, b) => a.priceUsd - b.priceUsd);
    const slice = cheaper.slice(0, 2);

    if (slice.length === 0) {
      return reply(
        `Дешевше в добірці під цей запит зараз немає. Можу показати найближчі за ціною або передати менеджеру.`,
      );
    }

    return matchMessage(
      slice,
      prefs,
      from ? `Нижче за ціною, ніж ${from.headline}.` : "Ось дешевші з добірки.",
      showCards,
    );
  }

  if (isUpperFloorIntent(text)) {
    const listings = searchListings(prefs)
      .filter((listing) => listing.floorNumber / listing.floorsTotal >= 0.65)
      .slice(0, 2);

    if (listings.length === 0) {
      return reply("У добірці немає явних верхніх поверхів під цей запит.");
    }

    return matchMessage(
      listings,
      prefs,
      "Ближче до верхніх поверхів:",
      showCards,
    );
  }

  if (showCards && session.lastMatchedSlugs.length > 0) {
    const listings = session.lastMatchedSlugs
      .map((slug) => getListingBySlug(slug))
      .filter((item): item is Listing => Boolean(item))
      .slice(0, 2);

    if (listings.length > 0) {
      return reply(
        "Ось картки тих адрес, про які говорили.",
        listings,
        true,
      );
    }
  }

  const knowledgeHits = retrieveKnowledge(text);
  const aboutCompany =
    /компані|хто ви|офіс|графік роботи|як ви працю|бронюван|купити квартир|оплат|іпотек|документ/.test(
      lower,
    );

  if (aboutCompany && !prefs.bedrooms && !prefs.budgetMaxUsd && !focus) {
    const lead =
      knowledgeHits[0]?.body.split("\n")[0] ??
      "NOVA: приватний підбір у Києві. Спочатку розмова, потім короткий список.";
    return reply(
      `${lead} ${slot ? qualifyQuestion(slot, prefs) : "Можу підібрати з добірки або з'єднати з менеджером."}`,
    );
  }

  if (
    focus &&
    /розкаж|характеристик|площа|поверх|ціна|скільки/.test(lower)
  ) {
    return reply(
      `${focus.headline}: ${formatUsdSymbol(focus.priceUsd)}, ${focus.bedrooms} спальні, ${focus.areaM2} м², поверх ${focus.floorNumber}/${focus.floorsTotal}. ${focus.why}\n/objects/${focus.slug}\nЗаписати перегляд?`,
      [focus],
      showCards,
    );
  }

  if (slot && !readyToMatch(prefs)) {
    return reply(qualifyQuestion(slot, prefs));
  }

  const matched = searchListings(prefs).slice(0, 2);

  if (matched.length === 0) {
    const nearest = getCatalog()
      .filter((listing) => listing.status === "available")
      .filter((listing) =>
        prefs.bedrooms == null ? true : listing.bedrooms === prefs.bedrooms,
      )
      .sort((a, b) => {
        if (!prefs.budgetMaxUsd) {
          return a.priceUsd - b.priceUsd;
        }

        return (
          Math.abs(a.priceUsd - prefs.budgetMaxUsd) -
          Math.abs(b.priceUsd - prefs.budgetMaxUsd)
        );
      })
      .slice(0, 2);

    return matchMessage(
      nearest,
      prefs,
      `Точного збігу під ${summary || "запит"} немає. Найближчі:`,
      showCards,
    );
  }

  return matchMessage(
    matched,
    prefs,
    summary
      ? `Під ${summary} маю два варіанти з добірки.`
      : "З добірки зараз підходять такі.",
    showCards,
  );
}

function buildRetrieval(session: AgentSession, text: string, discuss: boolean) {
  const prefs = session.preferences;
  const focus = resolveFocus(session, text);
  const knowledge = retrieveKnowledge(text, 4);
  const matched = discuss ? searchListings(prefs).slice(0, 4) : [];
  const listings = [
    ...(focus ? [focus] : []),
    ...matched.filter((listing) => listing.slug !== focus?.slug),
  ].slice(0, 4);

  const catalogOverview = getCatalog()
    .filter((listing) => listing.status === "available")
    .map(formatListingBrief)
    .join("\n");

  return {
    listings,
    knowledge,
    catalogText: discuss
      ? listings.map(formatListingBlock).join("\n\n---\n")
      : "",
    catalogOverview,
    knowledgeText: formatKnowledgeBlock(knowledge),
  };
}

type RunHints = {
  budgetHintUsd?: number;
  goalHint?: "live" | "invest";
};

export async function runAgent(
  session: AgentSession,
  userText: string,
  hints: RunHints = {},
): Promise<AgentReply> {
  session.preferences = extractPreferences(userText, session.preferences);

  if (
    hints.budgetHintUsd != null &&
    session.preferences.budgetMaxUsd == null
  ) {
    session.preferences.budgetMaxUsd = hints.budgetHintUsd;
  }
  if (hints.goalHint && !session.preferences.goal) {
    session.preferences.goal = hints.goalHint;
  }

  const lang = session.preferences.lang ?? "uk";

  if (RESCHEDULE_RE.test(userText) && session.preferences.bookingStatus === "submitted") {
    session.preferences.preferredSlotId = undefined;
    session.preferences.preferredDate = undefined;
    session.preferences.preferredTime = undefined;
    session.preferences.preferredSlotLabel = undefined;
    session.preferences.offeredSlots = undefined;
    session.preferences.bookingStatus = "collecting";
    session.handoff = undefined;
  }

  session.preferences = tryApplySlotFromMessage(
    session.preferences,
    userText,
    lang,
  );

  appendMessage(session, { role: "user", content: userText });

  const lastAssistant = [...session.messages]
    .reverse()
    .find((message) => message.role === "assistant")?.content;

  const officeInfo = isOfficeInfoQuestion(userText);
  if (officeInfo) {
    const addressText =
      lang === "ru"
        ? `Офис NOVA ESTATE: ${site.address}. Часы: ${site.hours}. Телефон: ${site.phone}.`
        : `Офіс NOVA ESTATE: ${site.address}. Години: ${site.hours}. Телефон: ${site.phone}.`;
    const answered = reply(addressText, [], false, {
      needsContact: false,
      source: "system",
    });
    appendMessage(session, { role: "assistant", content: answered.text });
    await saveSession(session);
    return answered;
  }

  const sideQuestion =
    session.preferences.bookingStatus === "collecting" &&
    isSideQuestionDuringBooking(userText);

  const wantsBooking =
    !sideQuestion &&
    (isHandoffIntent(userText) ||
      isBookingReadySignal(userText, lastAssistant) ||
      session.preferences.bookingStatus === "collecting");

  if (wantsBooking && session.preferences.bookingStatus !== "submitted") {
    session.preferences.bookingStatus = "collecting";
  }

  const submitted = await saveBookingIfReady(
    session,
    wantsBooking ? "chat" : "chat-inline",
  );
  if (submitted?.ok && "message" in submitted && submitted.message) {
    const confirmed = reply(submitted.message, [], false, {
      handoffRequested: true,
      needsContact: false,
      bookingStep: null,
      source: "system",
    });
    appendMessage(session, { role: "assistant", content: confirmed.text });
    await saveSession(session);
    return confirmed;
  }
  if (submitted && !submitted.ok) {
    const failText =
      lang === "ru" ? submitted.messageRu : submitted.messageUk;
    const failed = reply(failText, [], false, {
      handoffRequested: true,
      needsContact: false,
      bookingStep: nextBookingField(session.preferences),
      source: "system",
    });
    appendMessage(session, { role: "assistant", content: failed.text });
    await saveSession(session);
    return failed;
  }

  const bookingField =
    wantsBooking || session.preferences.bookingStatus === "collecting"
      ? nextBookingField(session.preferences)
      : null;

  if (bookingField && !sideQuestion) {
    const ensured = ensureOfferedSlots(session.preferences, lang);
    session.preferences = ensured.prefs;

    if (bookingField === "slot" && !session.preferences.preferredSlotLabel) {
      const matched = matchSlotChoice(
        userText,
        getUpcomingSlots({ count: 8 }),
      );
      if (matched) {
        session.preferences = applySlot(session.preferences, matched, lang);
      }
    }

    const fieldAfter = nextBookingField(session.preferences);
    if (!fieldAfter) {
      const again = await saveBookingIfReady(session, "chat");
      if (again?.ok && "message" in again && again.message) {
        const confirmed = reply(again.message, [], false, {
          handoffRequested: true,
          needsContact: false,
          source: "system",
        });
        appendMessage(session, { role: "assistant", content: confirmed.text });
        await saveSession(session);
        return confirmed;
      }
    }

    const step = fieldAfter ?? bookingField;
    const prompt = bookingPrompt(step, session.preferences, lang);
    const quickReplies =
      step === "meeting"
        ? meetingQuickReplies(lang)
        : step === "slot"
          ? slotQuickReplies(session.preferences.offeredSlots ?? [])
          : [];

    const guided = reply(prompt, [], false, {
      handoffRequested: true,
      needsContact: false,
      bookingStep: step,
      offeredSlots: session.preferences.offeredSlots,
      quickReplies,
      source: "system",
    });

    if (step === "meeting" || step === "slot" || step === "name" || step === "phone") {
      appendMessage(session, { role: "assistant", content: guided.text });
      await saveSession(session);
      return guided;
    }
  }

  const showCards = isShowCardsIntent(userText);
  const outOfScope = isOutOfScopeIntent(userText);
  const discuss = !outOfScope && canDiscussListings(session, userText);
  let result = catalogReply(session, userText, showCards);

  if (!outOfScope) {
    const retrieval = buildRetrieval(session, userText, discuss);
    const llm = getLlmConfig();

    if (llm) {
      const history = session.messages.slice(-40).map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const next = nextSlot(session.preferences);
      const slotsBlock = session.preferences.offeredSlots?.length
        ? session.preferences.offeredSlots
            .map((s, i) => `${i + 1}) ${s.label}`)
            .join("\n")
        : formatUpcomingSlots(lang);

      const catalogBlock = discuss
        ? `Релевантні об'єкти (детально):\n${retrieval.catalogText || "немає точних збігів"}\n\nУся добірка (коротко):\n${retrieval.catalogOverview}`
        : `Поки не називай адреси з каталогу. Веди живу розмову: одне уточнення, якщо треба. propertySlugs = [].\nПідказка наступного уточнення: ${next ?? "район / консультація"}.\n\nДовідково вся добірка:\n${retrieval.catalogOverview}`;

      const generated = await completeChat(llm, [
        { role: "system", content: agentInstructions },
        {
          role: "system",
          content: `Мова відповіді: ${lang === "ru" ? "російська" : "українська"}
Пам'ять клієнта: ${JSON.stringify(session.preferences)}
Наступне уточнення за потреби: ${next ?? "обговорення адрес / зустріч"}
Можна називати адреси текстом: ${discuss ? "так" : "ні"}
Клієнт просив картки зараз: ${showCards ? "так, можна propertySlugs (макс 2)" : "ні, propertySlugs обов'язково []"}
Фокус: ${session.focusSlug ?? "немає"}
Останні запропоновані: ${session.lastMatchedSlugs.join(", ") || "немає"}
Переглянуті: ${session.viewedSlugs.join(", ") || "немає"}
Доступні слоти (лише ці):\n${slotsBlock}
НЕ стверджуй, що заявку надіслано — це робить лише сервер.
Офіс агентства: ${site.address}. Години: ${site.hours}. Телефон: ${site.phone}.
Збирай запис лише текстом у діалозі. Форм у чаті немає.`,
        },
        { role: "system", content: catalogBlock },
        { role: "system", content: `База знань:\n${retrieval.knowledgeText}` },
        ...history,
      ]);

      if (generated) {
        let cardListings = (generated.propertySlugs ?? [])
          .map((slug) => getListingBySlug(slug))
          .filter((item): item is Listing => Boolean(item))
          .slice(0, 2);

        if (showCards && cardListings.length === 0) {
          cardListings = session.lastMatchedSlugs
            .map((slug) => getListingBySlug(slug))
            .filter((item): item is Listing => Boolean(item))
            .slice(0, 2);
        }

        const memoryListings =
          cardListings.length > 0
            ? cardListings
            : discuss
              ? searchListings(session.preferences).slice(0, 2)
              : [];

        result = {
          text: scrubFalseBookingClaims(generated.text.trim(), lang),
          suggestions: memoryListings.map(listingToSuggestion),
          showCards: showCards && cardListings.length > 0,
          quickReplies: [],
          handoffRequested: Boolean(generated.handoff) || result.handoffRequested,
          needsContact: false,
          bookingStep: null,
          source: "llm",
        };
      }
    }
  }

  const trackedSlugs = result.suggestions.map((item) => item.slug);
  rememberView(session, trackedSlugs);

  const cards = result.showCards ? result.suggestions.slice(0, 2) : [];
  result.suggestions = cards;
  result.showCards = cards.length > 0;

  if (wantsBooking && session.preferences.bookingStatus !== "submitted") {
    const step = nextBookingField(session.preferences);
    result.handoffRequested = true;
    result.needsContact = false;
    result.bookingStep = step;
    if (step === "meeting") {
      result.quickReplies = meetingQuickReplies(lang);
    } else if (step === "slot") {
      const ensured = ensureOfferedSlots(session.preferences, lang);
      session.preferences = ensured.prefs;
      result.offeredSlots = session.preferences.offeredSlots;
      result.quickReplies = slotQuickReplies(session.preferences.offeredSlots ?? []);
    }
  }

  appendMessage(session, {
    role: "assistant",
    content: result.text,
    propertySlugs: result.showCards
      ? result.suggestions.map((item) => item.slug)
      : undefined,
  });
  await saveSession(session);
  return result;
}

function formatUpcomingSlots(lang: "uk" | "ru") {
  return getUpcomingSlots({ count: 3 })
    .map((s, i) => `${i + 1}) ${lang === "ru" ? s.labelRu : s.labelUk}`)
    .join("\n");
}

export function handoffSummary(session: AgentSession) {
  const prefs = preferenceSummary(session.preferences);
  const viewed = session.viewedSlugs.slice(0, 4).join(", ");
  const last = session.messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content)
    .join(" | ");

  return [
    prefs ? `Потреби: ${prefs}.` : "Потреби не уточнені.",
    viewed ? `Дивились: ${viewed}.` : null,
    last ? `Останні репліки: ${last}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}
