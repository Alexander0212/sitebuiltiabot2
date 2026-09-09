import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { footerNavigation, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-paper/10 bg-ink text-paper">
      <div className="absolute inset-0">
        <Image
          src="/images/kyiv-street.webp"
          alt="Вулиця Києва біля районів підбору NOVA ESTATE"
          fill
          sizes="100vw"
          quality={85}
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-ink/78" />
      </div>
      <Container className="relative py-10 md:py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo inverted />
            <p className="mt-4 max-w-sm font-serif text-[1.35rem] leading-snug text-paper/85 italic">
              {site.tagline}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/70">
              {site.address}
              <span className="mt-1 block">{site.hours}</span>
            </p>
            <a
              href={site.phoneHref}
              className="mt-3 inline-block text-sm text-paper/80 hover:text-paper"
            >
              {site.phone}
            </a>
          </div>
          <nav aria-label="Навігація в підвалі">
            <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-[0.78rem] tracking-[0.12em] text-paper/80 uppercase transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/60"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 text-xs tracking-[0.08em] text-paper/60">
          © {new Date().getFullYear()} {site.name}
        </p>
      </Container>
    </footer>
  );
}
