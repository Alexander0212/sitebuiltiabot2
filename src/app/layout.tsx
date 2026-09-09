import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { AppProviders } from "@/components/providers/app-providers";
import { JsonLd } from "@/components/seo/json-ld";
import { cormorant, inter } from "@/lib/fonts";
import { site } from "@/lib/site";

import "./globals.css";

const title = `${site.name}: приватний підбір житла в Києві`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "нерухомість Київ",
    "підбір квартири",
    "інвестиції в нерухомість",
    "NOVA ESTATE",
  ],
  authors: [{ name: site.name, url: site.url }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: site.url,
    siteName: site.name,
    title,
    description: site.description,
    images: [
      {
        url: "/images/hero.webp",
        width: 1600,
        height: 2000,
        alt: "Інтер'єр з панорамними вікнами, NOVA ESTATE, Київ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/images/hero.webp"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <JsonLd />
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
