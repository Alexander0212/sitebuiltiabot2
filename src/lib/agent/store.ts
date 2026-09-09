import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AgentSession } from "@/types/agent";

export type SessionStore = {
  get(id: string): Promise<AgentSession | null>;
  save(session: AgentSession): Promise<void>;
};

const memory = new Map<string, AgentSession>();

function sessionDir() {
  return (
    process.env.AGENT_SESSION_DIR?.trim() ||
    path.join(process.cwd(), "data", "agent-sessions")
  );
}

async function ensureDir() {
  await mkdir(sessionDir(), { recursive: true });
}

function fileFor(id: string) {
  const safe = id.replace(/[^a-zA-Z0-9-_]/g, "");
  return path.join(sessionDir(), `${safe}.json`);
}

export const fileSessionStore: SessionStore = {
  async get(id) {
    const cached = memory.get(id);
    if (cached) {
      return cached;
    }

    try {
      const raw = await readFile(fileFor(id), "utf8");
      const parsed = JSON.parse(raw) as AgentSession;
      memory.set(id, parsed);
      return parsed;
    } catch {
      return null;
    }
  },

  async save(session) {
    memory.set(session.id, session);
    try {
      await ensureDir();
      await writeFile(fileFor(session.id), JSON.stringify(session), "utf8");
    } catch (error) {
      console.error("agent_session_persist_failed", {
        reason: error instanceof Error ? error.name : "unknown",
      });
    }
  },
};

export const sessionStore = fileSessionStore;
