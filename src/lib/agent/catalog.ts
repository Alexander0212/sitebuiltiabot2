import { properties } from "@/data/properties";
import { propertyFacts } from "@/data/property-facts";
import { formatUsdSymbol } from "@/lib/format";
import type { PropertyFacts, PropertySuggestion, UserPreferences } from "@/types/agent";
import type { Property } from "@/types/property";

export type CatalogListing = Property & PropertyFacts;

export function getCatalog(): CatalogListing[] {
  return properties.map((property) => {
    const facts = propertyFacts[property.id];
    if (!facts) {
      throw new Error(`Missing facts for ${property.id}`);
    }

    return { ...property, ...facts };
  });
}

export function getListingBySlug(slug: string) {
  return getCatalog().find((listing) => listing.slug === slug);
}

function clarifyFields(listing: CatalogListing) {
  const missing: string[] = [];

  if (listing.livingAreaM2 == null) {
    missing.push("житлова площа");
  }
  if (listing.condition == null) {
    missing.push("стан ремонту");
  }
  if (listing.coordinates == null) {
    missing.push("точна адреса");
  }
  if (!listing.features.some((item) => /балкон|тераса/.test(item.toLowerCase()))) {
    missing.push("балкон");
  }
  if (!listing.features.some((item) => /паркінг|парков/.test(item.toLowerCase()))) {
    missing.push("паркінг");
  }

  return missing;
}

export function listingToSuggestion(listing: CatalogListing): PropertySuggestion {
  return {
    slug: listing.slug,
    headline: listing.headline,
    title: listing.title,
    district: listing.district,
    priceUsd: listing.priceUsd,
    areaM2: listing.areaM2,
    bedrooms: listing.bedrooms,
    image: listing.image,
    provenance: "catalog",
    clarifyWithManager: clarifyFields(listing),
  };
}

export function formatListingBrief(listing: CatalogListing) {
  return `${listing.slug} | ${listing.headline} | ${formatUsdSymbol(listing.priceUsd)} | ${listing.bedrooms} спальні | ${listing.areaM2} м² | ${listing.district} | поверх ${listing.floorNumber}/${listing.floorsTotal} | /objects/${listing.slug} | ${listing.why}`;
}

export function formatListingBlock(listing: CatalogListing) {
  const living =
    listing.livingAreaM2 == null
      ? "житлова площа: немає даних"
      : `житлова площа: ${listing.livingAreaM2} м²`;
  const condition = listing.condition ?? "стан ремонту: немає даних";
  const coords = listing.coordinates
    ? `${listing.coordinates.lat}, ${listing.coordinates.lng}`
    : "координати: немає даних";

  return [
    `ID: ${listing.id}`,
    `slug: ${listing.slug}`,
    `сторінка: /objects/${listing.slug}`,
    `${listing.headline} (${listing.title})`,
    `тип: ${listing.type}`,
    `статус: ${listing.status}`,
    `район: ${listing.district}, ${listing.city}`,
    `адреса: ${listing.address}`,
    `ціна: ${formatUsdSymbol(listing.priceUsd)} ${listing.currency}`,
    `спальнь: ${listing.bedrooms}`,
    `площа: ${listing.areaM2} м²`,
    living,
    `поверх: ${listing.floorNumber} з ${listing.floorsTotal}`,
    `рік: ${listing.year}`,
    condition,
    `особливості: ${listing.features.join(", ") || "не вказано"}`,
    coords,
    `для кого: ${listing.forWhom}`,
    `чому: ${listing.why}`,
    listing.story,
  ].join("\n");
}

export function searchListings(prefs: UserPreferences) {
  return getCatalog()
    .filter((listing) => listing.status === "available")
    .filter((listing) =>
      prefs.budgetMaxUsd == null
        ? true
        : listing.priceUsd <= prefs.budgetMaxUsd * 1.05,
    )
    .filter((listing) =>
      prefs.bedrooms == null ? true : listing.bedrooms === prefs.bedrooms,
    )
    .filter((listing) =>
      prefs.minAreaM2 == null ? true : listing.areaM2 >= prefs.minAreaM2,
    )
    .filter((listing) =>
      prefs.district
        ? listing.district.toLowerCase().includes(prefs.district.toLowerCase())
        : true,
    )
    .sort((a, b) => {
      if (prefs.budgetMaxUsd == null) {
        return a.priceUsd - b.priceUsd;
      }

      return b.priceUsd - a.priceUsd;
    });
}

export function findListingsByText(query: string) {
  const q = query.toLowerCase();
  return getCatalog().filter((listing) => {
    const hay = [
      listing.slug,
      listing.title,
      listing.headline,
      listing.district,
      listing.id,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q) || q.includes(listing.slug);
  });
}

export function cheaperThan(slug: string, prefs: UserPreferences) {
  const current = getListingBySlug(slug);
  const cap = current?.priceUsd;

  return getCatalog()
    .filter((listing) => listing.status === "available")
    .filter((listing) => listing.slug !== slug)
    .filter((listing) => (cap == null ? true : listing.priceUsd < cap))
    .filter((listing) =>
      prefs.bedrooms == null ? true : listing.bedrooms === prefs.bedrooms,
    )
    .filter((listing) =>
      prefs.minAreaM2 == null ? true : listing.areaM2 >= prefs.minAreaM2,
    )
    .filter((listing) =>
      prefs.district
        ? listing.district.toLowerCase().includes(prefs.district.toLowerCase())
        : true,
    )
    .sort((a, b) => a.priceUsd - b.priceUsd);
}
