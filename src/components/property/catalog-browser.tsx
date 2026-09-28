"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import {
  filterProperties,
  type CatalogFilters,
} from "@/data/properties";
import type { Property } from "@/types/property";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

type CatalogBrowserProps = {
  properties: Property[];
  districts: string[];
};

function parseFilters(params: URLSearchParams): CatalogFilters {
  const kind = params.get("kind");
  const district = params.get("district") ?? undefined;
  const bedroomsRaw = params.get("bedrooms");
  const budget = params.get("budget");

  let bedrooms: CatalogFilters["bedrooms"] = "all";
  if (bedroomsRaw === "4plus") bedrooms = "4plus";
  else if (bedroomsRaw === "1" || bedroomsRaw === "2" || bedroomsRaw === "3") {
    bedrooms = Number(bedroomsRaw) as 1 | 2 | 3;
  }

  return {
    kind:
      kind === "apartment" || kind === "house" || kind === "all"
        ? kind
        : "all",
    district: district || "all",
    bedrooms,
    budget:
      budget === "under150" ||
      budget === "under200" ||
      budget === "under250" ||
      budget === "over250" ||
      budget === "all"
        ? budget
        : "all",
  };
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-3 py-2 text-[0.72rem] tracking-[0.12em] uppercase transition-colors duration-300",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-warm bg-transparent text-ink-soft hover:border-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function CatalogBrowser({ properties, districts }: CatalogBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const filtered = useMemo(
    () => filterProperties(properties, filters),
    [properties, filters],
  );

  const shown = filtered.slice(0, visible);
  const hasMore = shown.length < filtered.length;

  function updateFilter(key: keyof CatalogFilters, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setVisible(PAGE_SIZE);
    startTransition(() => {
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function resetFilters() {
    setVisible(PAGE_SIZE);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  const apartments = properties.filter((p) => p.kind === "apartment").length;
  const houses = properties.filter((p) => p.kind === "house").length;

  return (
    <div className={cn(isPending && "opacity-80 transition-opacity")}>
      <div className="flex flex-col gap-6 border-b border-warm pb-8">
        <div className="flex flex-wrap gap-2">
          <Chip
            active={!filters.kind || filters.kind === "all"}
            onClick={() => updateFilter("kind", "all")}
          >
            Усі · {properties.length}
          </Chip>
          <Chip
            active={filters.kind === "apartment"}
            onClick={() => updateFilter("kind", "apartment")}
          >
            Квартири · {apartments}
          </Chip>
          <Chip
            active={filters.kind === "house"}
            onClick={() => updateFilter("kind", "house")}
          >
            Будинки · {houses}
          </Chip>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block min-w-0">
            <span className="text-[0.72rem] tracking-[0.14em] text-ink-soft uppercase">
              Район
            </span>
            <select
              className="mt-2 w-full border border-warm bg-paper px-3 py-3 text-sm outline-none focus-visible:border-bronze"
              value={filters.district ?? "all"}
              onChange={(event) => updateFilter("district", event.target.value)}
            >
              <option value="all">Усі райони</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="text-[0.72rem] tracking-[0.14em] text-ink-soft uppercase">
              Спальні
            </span>
            <select
              className="mt-2 w-full border border-warm bg-paper px-3 py-3 text-sm outline-none focus-visible:border-bronze"
              value={
                filters.bedrooms === undefined || filters.bedrooms === "all"
                  ? "all"
                  : String(filters.bedrooms)
              }
              onChange={(event) => updateFilter("bedrooms", event.target.value)}
            >
              <option value="all">Будь-які</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4plus">4+</option>
            </select>
          </label>

          <label className="block min-w-0">
            <span className="text-[0.72rem] tracking-[0.14em] text-ink-soft uppercase">
              Бюджет
            </span>
            <select
              className="mt-2 w-full border border-warm bg-paper px-3 py-3 text-sm outline-none focus-visible:border-bronze"
              value={filters.budget ?? "all"}
              onChange={(event) => updateFilter("budget", event.target.value)}
            >
              <option value="all">Будь-який</option>
              <option value="under150">до $150 000</option>
              <option value="under200">до $200 000</option>
              <option value="under250">до $250 000</option>
              <option value="over250">від $250 000</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Показано{" "}
          <span className="text-foreground">
            {shown.length} з {filtered.length}
          </span>
          {filtered.length !== properties.length ? " за фільтром" : ""}
        </p>
        {(filters.kind && filters.kind !== "all") ||
        (filters.district && filters.district !== "all") ||
        (filters.bedrooms && filters.bedrooms !== "all") ||
        (filters.budget && filters.budget !== "all") ? (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[0.72rem] tracking-[0.12em] text-ink-soft uppercase underline-offset-4 hover:text-foreground hover:underline"
          >
            Скинути фільтри
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 border border-warm bg-canvas px-6 py-12 text-center">
          <p className="font-serif text-2xl">Немає збігів за цими фільтрами</p>
          <p className="mt-3 text-sm text-ink-soft">
            Скиньте умови або запишіться на підбір — підберемо поза публічною
            добіркою.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="brandOutline" size="cta" onClick={resetFilters}>
              Скинути фільтри
            </Button>
            <Button asChild variant="brand" size="cta">
              <Link href="/#contact">Записатись на підбір</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((property) => (
              <li key={property.id} className="min-w-0">
                <PropertyCard property={property} layout="grid" />
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div className="mt-10 flex justify-center">
              <Button
                variant="brandOutline"
                size="cta"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
              >
                Показати ще
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
