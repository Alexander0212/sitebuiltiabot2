export type MeetingType = "online" | "discuss" | "office";

export type ClientIntent =
  | "buy"
  | "rent"
  | "sell"
  | "lease"
  | "consult";

export type PropertyKind =
  | "apartment"
  | "house"
  | "newbuild"
  | "secondary"
  | "commercial";

export type ClientGoal = "live" | "invest" | "family" | "relocate" | "other";

export type AgentLang = "uk" | "ru";

export type BookingStatus = "idle" | "collecting" | "submitted" | "error";

export type OfferedSlot = {
  id: string;
  dateISO: string;
  time: string;
  label: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  propertySlugs?: string[];
};

export type UserPreferences = {
  lang?: AgentLang;
  intent?: ClientIntent;
  propertyType?: PropertyKind;
  budgetMaxUsd?: number;
  budgetMinUsd?: number;
  bedrooms?: number;
  minAreaM2?: number;
  district?: string;
  anyDistrict?: boolean;
  goal?: ClientGoal;
  meetingType?: MeetingType;
  preferredSlotId?: string;
  preferredDate?: string;
  preferredTime?: string;
  preferredSlotLabel?: string;
  offeredSlots?: OfferedSlot[];
  name?: string;
  phone?: string;
  notes?: string;
  bookingStatus?: BookingStatus;
};

export type HandoffRecord = {
  requestedAt: string;
  summary: string;
  name?: string;
  phone?: string;
  meetingType?: MeetingType;
  slotLabel?: string;
  date?: string;
  time?: string;
  sheetOk?: boolean;
};

export type AgentSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  preferences: UserPreferences;
  viewedSlugs: string[];
  lastMatchedSlugs: string[];
  focusSlug?: string;
  handoff?: HandoffRecord;
};

export type PropertySuggestion = {
  slug: string;
  headline: string;
  title: string;
  district: string;
  priceUsd: number;
  areaM2: number;
  bedrooms: number;
  image: string;
  provenance: "catalog";
  clarifyWithManager: string[];
};

export type QuickReply = {
  label: string;
  message: string;
};

export type AgentReply = {
  text: string;
  suggestions: PropertySuggestion[];
  showCards: boolean;
  quickReplies: QuickReply[];
  handoffRequested: boolean;
  needsContact: boolean;
  bookingStep?: "meeting" | "slot" | "name" | "phone" | null;
  offeredSlots?: OfferedSlot[];
  source: "llm" | "catalog" | "system";
};

export type PropertyStatus = "available" | "reserved" | "sold";

export type PropertyFacts = {
  type: "apartment";
  livingAreaM2: number | null;
  floorNumber: number;
  floorsTotal: number;
  currency: "USD";
  address: string;
  coordinates: { lat: number; lng: number } | null;
  condition: string | null;
  features: string[];
  status: PropertyStatus;
};
