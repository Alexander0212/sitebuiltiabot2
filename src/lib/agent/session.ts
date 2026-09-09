import { cookies } from "next/headers";

import { sessionStore } from "@/lib/agent/store";
import type { AgentSession, ChatMessage } from "@/types/agent";

export const SESSION_COOKIE = "nova_sid";
const MAX_MESSAGES = 80;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60;

export function createEmptySession(id: string): AgentSession {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    messages: [],
    preferences: {},
    viewedSlugs: [],
    lastMatchedSlugs: [],
  };
}

export function appendMessage(
  session: AgentSession,
  message: Omit<ChatMessage, "id" | "createdAt"> & { id?: string },
) {
  const next: ChatMessage = {
    id: message.id ?? crypto.randomUUID(),
    role: message.role,
    content: message.content,
    createdAt: new Date().toISOString(),
    propertySlugs: message.propertySlugs,
  };

  session.messages = [...session.messages, next].slice(-MAX_MESSAGES);
  session.updatedAt = next.createdAt;
  return next;
}

export function rememberView(session: AgentSession, slugs: string[]) {
  for (const slug of slugs) {
    session.viewedSlugs = [
      slug,
      ...session.viewedSlugs.filter((item) => item !== slug),
    ].slice(0, 12);
  }

  if (slugs[0]) {
    session.focusSlug = slugs[0];
  }

  if (slugs.length > 0) {
    session.lastMatchedSlugs = slugs;
  }
}

export async function getOrCreateSession() {
  const jar = await cookies();
  let id = jar.get(SESSION_COOKIE)?.value;
  let created = false;

  if (!id || !/^[a-zA-Z0-9-]{8,80}$/.test(id)) {
    id = crypto.randomUUID();
    created = true;
  }

  let session = await sessionStore.get(id);
  if (!session) {
    session = createEmptySession(id);
    created = true;
    await sessionStore.save(session);
  }

  if (created) {
    jar.set(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }

  return session;
}

export async function saveSession(session: AgentSession) {
  session.updatedAt = new Date().toISOString();
  await sessionStore.save(session);
}
