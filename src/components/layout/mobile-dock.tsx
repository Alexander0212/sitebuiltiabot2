import Link from "next/link";

import { Button } from "@/components/ui/button";
import { primaryCta, site } from "@/lib/site";

export function MobileDock() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-warm/80 bg-background/92 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg gap-3">
        <Button
          asChild
          variant="brandOutline"
          className="h-12 flex-1 rounded-none text-[0.75rem] tracking-[0.12em] uppercase"
        >
          <a href={site.phoneHref}>Зателефонувати</a>
        </Button>
        <Button
          asChild
          variant="brand"
          className="h-12 flex-1 rounded-none text-[0.75rem] tracking-[0.12em] uppercase"
        >
          <Link href={primaryCta.href}>{primaryCta.shortLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
