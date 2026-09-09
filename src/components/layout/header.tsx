"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navigation, primaryCta, site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      data-intro="header"
      className="sticky top-0 z-50 border-b border-warm/80 bg-background/88 backdrop-blur-md"
    >
      <Container className="flex h-14 items-center justify-between gap-3 lg:h-16">
        <div data-intro-item="logo">
          <Logo />
        </div>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Основна навігація"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-intro-item="nav"
              className="text-[0.75rem] font-medium tracking-[0.16em] text-ink-soft uppercase transition-colors duration-300 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 focus-visible:ring-offset-4 active:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex" data-intro-item="actions">
          <a
            href={site.phoneHref}
            className="text-[0.75rem] tracking-[0.08em] text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 focus-visible:ring-offset-4"
          >
            {site.phone}
          </a>
          <Button
            asChild
            className="h-10 rounded-none px-5 text-[0.72rem] tracking-[0.16em] uppercase"
          >
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        </div>

        <div data-intro-item="menu" className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 rounded-none"
                aria-label="Відкрити меню"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-none border-warm bg-background sm:max-w-md"
            >
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="sr-only">Меню</SheetTitle>
                <SheetDescription className="sr-only">
                  Навігація сайту {site.name}
                </SheetDescription>
                <Logo />
              </SheetHeader>
              <nav
                className="flex flex-1 flex-col gap-1 px-6 pt-10"
                aria-label="Мобільна навігація"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="min-h-12 font-serif text-3xl leading-tight text-foreground transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto space-y-5 px-6 pb-10">
                <Button
                  asChild
                  className="h-12 w-full rounded-none text-[0.75rem] tracking-[0.16em] uppercase"
                >
                  <Link href={primaryCta.href} onClick={() => setOpen(false)}>
                    {primaryCta.label}
                  </Link>
                </Button>
                <a
                  href={site.phoneHref}
                  className="block text-sm text-muted-foreground"
                >
                  {site.phone}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
