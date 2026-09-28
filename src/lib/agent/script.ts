import { formatUsdSymbol } from "@/lib/format";
import type { QuickReply, UserPreferences } from "@/types/agent";
import type { CatalogListing } from "@/lib/agent/catalog";

export type QualifySlot = "goal" | "budget" | "bedrooms";

export function nextSlot(prefs: UserPreferences): QualifySlot | null {
  if (!prefs.goal) {
    return "goal";
  }

  if (prefs.budgetMaxUsd == null) {
    return "budget";
  }

  if (prefs.bedrooms == null) {
    return "bedrooms";
  }

  return null;
}

export function readyToMatch(prefs: UserPreferences) {
  return Boolean(prefs.goal && prefs.budgetMaxUsd && prefs.bedrooms);
}

export function qualifyQuestion(slot: QualifySlot, prefs: UserPreferences) {
  if (slot === "goal") {
    return "Підкажіть, це квартира для себе чи більше як інвестиція під дохід?";
  }

  if (slot === "budget") {
    if (prefs.goal === "invest") {
      return "Який комфортний бюджет у доларах на лот під дохід?";
    }
    if (prefs.goal === "live") {
      return "Який комфортний бюджет у доларах на квартиру для життя?";
    }
    return "Який комфортний бюджет у доларах?";
  }

  return "Скільки спалень вам потрібно?";
}

export function closingQuestion(prefs: UserPreferences, count: number) {
  const lang = prefs.lang ?? "uk";
  if (!prefs.district && !prefs.anyDistrict) {
    return lang === "en"
      ? "Which district fits better, or shall we book a short call now?"
      : "Який район ближче, чи одразу запишемо короткий дзвінок?";
  }

  if (count === 1) {
    return lang === "en"
      ? "I can book a viewing or a short call. What works better?"
      : "Можу записати перегляд або короткий дзвінок. Як зручніше?";
  }

  return lang === "en"
    ? "I can briefly compare them or book a call or office visit. What is easier?"
    : "Можу коротко порівняти або записати на дзвінок/офіс. Що зручніше?";
}

export function presentListing(listing: CatalogListing) {
  const level =
    listing.type === "house"
      ? "будинок"
      : `поверх ${listing.floorNumber}/${listing.floorsTotal}`;
  return `${listing.headline}: ${formatUsdSymbol(listing.priceUsd)}, ${listing.bedrooms} спальні, ${listing.areaM2} м², ${level}. ${listing.why}`;
}

export function presentListings(listings: CatalogListing[]) {
  return listings.map(presentListing).join("\n\n");
}

export function compareListings(listings: CatalogListing[]) {
  if (listings.length < 2) {
    return presentListings(listings);
  }

  const [first, second] = listings;
  return `${presentListing(first)}\n\n${presentListing(second)}`;
}

export function isShowCardsIntent(text: string) {
  return /покажи|скинь|картк|фото|прев.?ю|з картинк|подивитись об.?єкт|посилання з фото|скинути варіант/.test(
    text.toLowerCase(),
  );
}

/** Chip suggestions are intentionally empty: chat should feel human, not like a form. */
export function conversationReplies(
  _prefs: UserPreferences,
  _hasOffers: boolean,
  _extras: QuickReply[] = [],
): QuickReply[] {
  return [];
}
