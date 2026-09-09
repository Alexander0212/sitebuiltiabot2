import { rateLimit } from "@/lib/agent/rate-limit";
import { runAgent } from "@/lib/agent/run";
import { getOrCreateSession } from "@/lib/agent/session";
import { chatMessageSchema } from "@/lib/validations/agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некоректний запит" }, { status: 400 });
  }

  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Перевірте повідомлення" },
      { status: 400 },
    );
  }

  const session = await getOrCreateSession();
  const limited = rateLimit(session.id);

  if (!limited.ok) {
    return Response.json(
      {
        error: "Забагато запитів. Зачекайте кілька хвилин або зателефонуйте нам.",
      },
      { status: 429 },
    );
  }

  try {
    const reply = await runAgent(session, parsed.data.message, {
      budgetHintUsd: parsed.data.budgetHintUsd,
      goalHint: parsed.data.goalHint,
    });
    return Response.json(reply);
  } catch (error) {
    console.error("agent_chat_failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return Response.json(
      { error: "Консультант тимчасово недоступний. Спробуйте ще раз." },
      { status: 500 },
    );
  }
}
