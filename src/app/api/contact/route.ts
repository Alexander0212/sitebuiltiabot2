import { rateLimit } from "@/lib/agent/rate-limit";
import { persistLead } from "@/lib/agent/leads";
import { contactFormSchema } from "@/lib/validations/contact";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некоректний запит" }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Перевірте дані" },
      { status: 400 },
    );
  }

  const limited = rateLimit(`contact:${parsed.data.phone}`);
  if (!limited.ok) {
    return Response.json(
      {
        error:
          "Забагато запитів. Зачекайте кілька хвилин або зателефонуйте нам.",
      },
      { status: 429 },
    );
  }

  const persisted = await persistLead({
    at: new Date().toISOString(),
    source: "form",
    name: parsed.data.name,
    phone: parsed.data.phone,
    meetingType: parsed.data.meetingType,
    lookingFor: parsed.data.lookingFor,
    budget: parsed.data.budget,
    notes: parsed.data.lookingFor,
  });

  if (!persisted.ok) {
    return Response.json(
      { error: persisted.messageUk },
      { status: 502 },
    );
  }

  return Response.json({
    ok: true,
    message: "Заявку прийнято. Ми зв'яжемось з вами найближчим часом.",
  });
}
