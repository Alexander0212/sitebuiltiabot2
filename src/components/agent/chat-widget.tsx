"use client";

import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { useEffect, useId, useRef, useState } from "react";
import { Maximize2, Minimize2, MessageCircle, X } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { consultant } from "@/lib/agent/persona";
import {
  budgetBridgeQuickReply,
  readBudgetBridge,
  type BudgetBridge,
} from "@/lib/budget-bridge";
import { formatUsdSymbol } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type {
  AgentReply,
  ChatMessage,
  PropertySuggestion,
  QuickReply,
} from "@/types/agent";

const PEEK_KEY = "nova-chat-peek-dismissed";
const OPEN_AFTER_SCROLL = 140;

type VisibleMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: PropertySuggestion[];
  showCards?: boolean;
};

function TypingIndicator() {
  return (
    <div
      className="inline-flex items-center gap-2 text-[0.82rem] text-ink-soft"
      aria-live="polite"
      aria-label={consultant.typingLabel}
    >
      <span>{consultant.typingLabel}</span>
      <span className="consultant-typing" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function typingDelayMs(text: string) {
  if (prefersReducedMotion()) {
    return 0;
  }

  return Math.min(1400, Math.max(450, Math.round(text.length * 12)));
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [wide, setWide] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<VisibleMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [budgetBridge, setBudgetBridge] = useState<BudgetBridge | null>(null);
  const [bridgeUsed, setBridgeUsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const peekDismissedRef = useRef(false);
  const peekShownRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    try {
      peekDismissedRef.current = sessionStorage.getItem(PEEK_KEY) === "1";
    } catch {
      peekDismissedRef.current = false;
    }

    setBudgetBridge(readBudgetBridge());

    function onBridge(event: Event) {
      const detail = (event as CustomEvent<BudgetBridge>).detail;
      setBudgetBridge(detail ?? readBudgetBridge());
    }

    window.addEventListener("nova-budget-bridge", onBridge);
    return () => window.removeEventListener("nova-budget-bridge", onBridge);
  }, []);

  useLenis((lenis) => {
    if (peekShownRef.current || peekDismissedRef.current || open) {
      return;
    }

    if (lenis.scroll < OPEN_AFTER_SCROLL) {
      return;
    }

    peekShownRef.current = true;
    window.setTimeout(() => {
      if (!peekDismissedRef.current && !open) {
        setPeek(true);
      }
    }, 320);
  });

  useEffect(() => {
    function onScroll() {
      if (peekShownRef.current || peekDismissedRef.current || open) {
        return;
      }

      if (window.scrollY < OPEN_AFTER_SCROLL) {
        return;
      }

      peekShownRef.current = true;
      window.setTimeout(() => {
        if (!peekDismissedRef.current && !open) {
          setPeek(true);
        }
      }, 320);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  function dismissPeek() {
    peekDismissedRef.current = true;
    setPeek(false);
    try {
      sessionStorage.setItem(PEEK_KEY, "1");
    } catch {
      // ignore
    }
  }

  function expandChat() {
    setPeek(false);
    setOpen(true);
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  function collapseChat() {
    setOpen(false);
    setWide(false);
  }

  function requestManager() {
    if (!open) {
      expandChat();
    }
    void send("Хочу записатись на зустріч");
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/agent/session", {
          credentials: "same-origin",
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          messages: (ChatMessage & { suggestions?: PropertySuggestion[] })[];
          preferences?: { budgetMaxUsd?: number };
        };
        if (cancelled) {
          return;
        }

        setMessages((current) => {
          if (current.length > data.messages.length) {
            return current;
          }

          return data.messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            suggestions: message.suggestions,
            showCards: (message.suggestions?.length ?? 0) > 0,
          }));
        });

        const bridge = readBudgetBridge();
        setBudgetBridge(bridge);
        if (data.preferences?.budgetMaxUsd != null || data.messages.length > 0) {
          setBridgeUsed(true);
        }
      } catch {
        if (!cancelled) {
          setError("Не вдалося відкрити попередню розмову.");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    const node = listRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, pending, open, wide]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) {
      return;
    }

    if (!open) {
      expandChat();
    }

    setError(null);
    setInput("");
    const optimistic: VisibleMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((current) => [...current, optimistic]);
    setPending(true);

    const startedAt = Date.now();
    const bridge = budgetBridge ?? readBudgetBridge();

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          ...(bridge
            ? {
                budgetHintUsd: bridge.maximumPropertyBudget,
                goalHint: bridge.goal,
              }
            : {}),
        }),
      });
      const data = (await response.json()) as AgentReply & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Не вдалося надіслати повідомлення.");
        return;
      }

      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, typingDelayMs(data.text) - elapsed);
      if (wait > 0) {
        await sleep(wait);
      }

      setQuickReplies(data.quickReplies ?? []);
      setBridgeUsed(true);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.text,
          suggestions: data.suggestions,
          showCards: Boolean(data.showCards && data.suggestions?.length),
        },
      ]);
    } catch {
      setError("Мережа недоступна. Спробуйте ще раз.");
    } finally {
      setPending(false);
    }
  }

  const budgetChip: QuickReply | null =
    !bridgeUsed && messages.length === 0 && budgetBridge
      ? budgetBridgeQuickReply(budgetBridge)
      : null;

  const visibleReplies =
    quickReplies.length > 0 ? quickReplies : budgetChip ? [budgetChip] : [];

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      {peek && !open ? (
        <div className="pointer-events-auto w-[min(18rem,calc(100vw-5.5rem))] border border-warm bg-paper p-3 shadow-editorial duration-300 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[0.68rem] tracking-[0.14em] text-bronze-ink uppercase">
                {consultant.launcherHint}
              </p>
              <p className="mt-1 font-serif text-[1.05rem] leading-snug">
                {consultant.name}
              </p>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-soft">
                Можу коротко підказати по району чи бюджету.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissPeek}
              className="flex size-8 shrink-0 items-center justify-center text-ink-soft outline-none hover:text-foreground"
              aria-label="Закрити підказку"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <LogoMark className="size-6 text-bronze-ink" />
            <button
              type="button"
              onClick={expandChat}
              className="mt-3 text-[0.75rem] tracking-[0.12em] text-ink-soft uppercase underline-offset-4 hover:text-foreground hover:underline"
            >
              Написати
            </button>
          </div>
        </div>
      ) : null}

      {open ? (
        <section
          role="dialog"
          aria-labelledby={titleId}
          className={cn(
            "pointer-events-auto flex w-[min(22rem,calc(100vw-2rem))] flex-col border border-warm bg-paper text-foreground shadow-editorial duration-300 animate-in fade-in slide-in-from-bottom-2",
            wide
              ? "h-[min(38rem,calc(100svh-8.5rem))] lg:h-[min(40rem,calc(100svh-6rem))]"
              : "h-[min(28rem,56svh)] lg:h-[min(32rem,62svh)]",
          )}
        >
          <header className="flex items-start justify-between gap-2 border-b border-warm px-3 py-2.5">
            <div>
              <p className="text-[0.72rem] tracking-[0.16em] text-bronze-ink uppercase">
                {consultant.role}
              </p>
              <h2 id={titleId} className="font-serif text-lg leading-tight">
                {consultant.name}
              </h2>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={requestManager}
                className="mr-1 px-2 py-1.5 text-[0.68rem] tracking-[0.1em] text-ink-soft uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-bronze/50"
              >
                Менеджер
              </button>
              <button
                type="button"
                onClick={() => setWide((current) => !current)}
                className="flex size-9 items-center justify-center text-ink-soft outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-bronze/50"
                aria-label={wide ? "Зменшити чат" : "Збільшити чат"}
              >
                {wide ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
              <button
                type="button"
                onClick={collapseChat}
                className="flex size-9 items-center justify-center text-ink-soft outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-bronze/50"
                aria-label="Згорнути чат"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <div>
                <p className="font-serif text-[1.15rem] leading-snug">
                  {consultant.greeting}
                </p>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
                  {consultant.prompt}
                </p>
              </div>
            ) : null}

            {messages.map((message) => (
              <article key={message.id} className="space-y-2">
                <p
                  className={cn(
                    "max-w-[92%] whitespace-pre-wrap text-[0.92rem] leading-relaxed",
                    message.role === "user"
                      ? "ml-auto border border-warm bg-canvas px-3 py-2"
                      : "text-foreground",
                  )}
                >
                  {message.content}
                </p>
                {message.showCards &&
                message.suggestions &&
                message.suggestions.length > 0 ? (
                  <ul className="grid max-w-[92%] gap-2">
                    {message.suggestions.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/objects/${item.slug}`}
                          className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 border border-warm bg-canvas outline-none hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-bronze/50"
                        >
                          <span className="relative block min-h-[3.2rem]">
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="56px"
                              quality={85}
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0 py-1.5 pr-2">
                            <span className="text-[0.6rem] tracking-[0.12em] text-bronze-ink uppercase">
                              З добірки
                            </span>
                            <span className="mt-0.5 block font-serif text-[0.95rem] leading-snug">
                              {item.headline}
                            </span>
                            <span className="mt-0.5 block text-[0.72rem] text-ink-soft">
                              {formatUsdSymbol(item.priceUsd)} · {item.district}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}

            {pending ? <TypingIndicator /> : null}

            {!pending && visibleReplies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {visibleReplies.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setBridgeUsed(true);
                      void send(item.message);
                    }}
                    className="border border-warm bg-canvas px-2.5 py-1.5 text-[0.7rem] tracking-[0.08em] uppercase outline-none transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-bronze/50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="border-t border-warm">
            <button
              type="button"
              onClick={requestManager}
              className="w-full border-b border-warm px-3 py-2 text-left text-[0.72rem] tracking-[0.12em] text-ink-soft uppercase outline-none hover:bg-canvas hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bronze/50"
            >
              {consultant.managerCta}
            </button>
            <form
              className="p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
            >
              {error ? (
                <p role="alert" className="mb-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Відповідайте Олесі"
                  maxLength={2000}
                  disabled={pending}
                  className="h-11 rounded-none"
                  aria-label="Повідомлення консультанту"
                />
                <Button
                  type="submit"
                  variant="brand"
                  disabled={pending || input.trim().length === 0}
                  className="h-11 rounded-none px-4 text-[0.72rem] tracking-[0.12em] uppercase"
                >
                  Надіслати
                </Button>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => (open ? collapseChat() : expandChat())}
        className={cn(
          "pointer-events-auto flex items-center gap-3 bg-ink text-paper outline-none transition-colors hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-bronze/60",
          open ? "size-14 justify-center" : "h-14 pr-4 pl-3.5",
          !open && "consultant-pulse",
        )}
        aria-label={
          open ? "Згорнути консультанта" : `Відкрити чат з ${consultant.name}`
        }
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <>
            <span className="flex size-8 shrink-0 items-center justify-center border border-paper/25">
              <MessageCircle className="size-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-[0.68rem] tracking-[0.14em] text-paper/65 uppercase">
                {consultant.launcherHint}
              </span>
              <span className="mt-0.5 block text-[0.78rem] tracking-[0.1em] uppercase">
                {consultant.launcherLabel}
              </span>
            </span>
          </>
        )}
      </button>
    </div>
  );
}
