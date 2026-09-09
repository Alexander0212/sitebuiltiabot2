import { listingToSuggestion, getListingBySlug } from "@/lib/agent/catalog";
import { getOrCreateSession } from "@/lib/agent/session";
import type { CatalogListing } from "@/lib/agent/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getOrCreateSession();

  return Response.json({
    messages: session.messages.map((message) => ({
      ...message,
      suggestions: (message.propertySlugs ?? [])
        .map((slug) => getListingBySlug(slug))
        .filter((item): item is CatalogListing => Boolean(item))
        .map((item) => listingToSuggestion(item)),
    })),
    preferences: session.preferences,
    handoff: session.handoff ?? null,
    quickReplies: [],
  });
}
