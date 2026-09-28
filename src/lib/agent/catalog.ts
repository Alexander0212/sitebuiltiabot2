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
  const level =
    listing.type === "house"
      ? "будинок"
      : `поверх ${listing.floorNumber}/${listing.floorsTotal}`;
  return `${listing.headline}: ${formatUsdSymbol(listing.priceUsd)}, ${listing.bedrooms} спальні, ${listing.areaM2} м², ${level}. ${listing.why}`;
}

/** Facts for the model. Client text must not paste raw /objects/slug paths. */
export function formatListingBlock(listing: CatalogListing) {
  return [
    formatListingBrief(listing),
    `slug (лише для propertySlugs, не пиши клієнту): ${listing.slug}`,
    listing.livingAreaM2 != null ? `житлова: ${listing.livingAreaM2} м²` : null,
    listing.condition ? `стан: ${listing.condition}` : null,
    `район: ${listing.district}`,
    listing.features.length
      ? `фічі: ${listing.features.slice(0, 4).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Grouped catalog map for the model. Built from listings, not a handwritten district list. */
export function buildCatalogKnowledge() {
  const available = getCatalog().filter((listing) => listing.status === "available");
  const byDistrict = new Map<string, CatalogListing[]>();
  for (const listing of available) {
    const bucket = byDistrict.get(listing.district) ?? [];
    bucket.push(listing);
    byDistrict.set(listing.district, bucket);
  }

  const districtBlocks = [...byDistrict.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "uk"))
    .map(([district, items]) => {
      const lines = items
        .sort((a, b) => a.priceUsd - b.priceUsd)
        .map((listing) => {
          const kind = listing.type === "house" ? "будинок" : "квартира";
          const level =
            listing.type === "house"
              ? "будинок"
              : `поверх ${listing.floorNumber}/${listing.floorsTotal}`;
          return `- ${listing.headline} | ${kind} | ${listing.bedrooms} спальні | ${listing.areaM2} м² | ${level} | ${formatUsdSymbol(listing.priceUsd)} | slug:${listing.slug}`;
        });
      return `### ${district} (${items.length})\n${lines.join("\n")}`;
    });

  const byBeds = new Map<number, string[]>();
  for (const listing of available) {
    const bucket = byBeds.get(listing.bedrooms) ?? [];
    bucket.push(`${listing.district}: ${listing.headline} (${formatUsdSymbol(listing.priceUsd)})`);
    byBeds.set(listing.bedrooms, bucket);
  }
  const bedBlocks = [...byBeds.entries()]
    .sort(([a], [b]) => a - b)
    .map(([beds, lines]) => `### ${beds} спальні\n${lines.map((line) => `- ${line}`).join("\n")}`);

  return [
    `Публічна добірка: ${available.length} адрес. Якщо району немає в цьому списку, картки немає. Не кажи, що району немає, якщо він є нижче.`,
    "## За районами",
    ...districtBlocks,
    "## За кількістю спалень",
    ...bedBlocks,
  ].join("\n\n");
}

export function listingsInDistrict(district: string) {
  const needle = district.toLowerCase();
  return getCatalog().filter(
    (listing) =>
      listing.status === "available" &&
      listing.district.toLowerCase() === needle,
  );
}

export function searchListings(prefs: UserPreferences) {
  return getCatalog()
    .filter((listing) => listing.status === "available")
    .filter((listing) => {
      if (prefs.propertyType === "house") {
        return listing.type === "house";
      }
      if (
        prefs.propertyType === "apartment" ||
        prefs.propertyType === "newbuild" ||
        prefs.propertyType === "secondary"
      ) {
        return listing.type === "apartment";
      }
      return true;
    })
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
