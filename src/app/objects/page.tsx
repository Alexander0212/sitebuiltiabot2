import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogBrowser } from "@/components/property/catalog-browser";
import { Container } from "@/components/layout/container";
import {
  getPropertyDistricts,
  properties,
} from "@/data/properties";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Об'єкти",
  description:
    "Публічна добірка NOVA ESTATE: 26 адрес у Києві та області — квартири й будинки з фільтрами за районом, бюджетом і кількістю спалень.",
  alternates: {
    canonical: "/objects",
  },
  openGraph: {
    title: `Об'єкти · ${site.name}`,
    description:
      "26 адрес у публічній добірці: квартири та будинки. Фільтри за типом, районом, бюджетом.",
    url: `${site.url}/objects`,
  },
};

export default function ObjectsPage() {
  const districts = getPropertyDistricts();

  return (
    <div className="pb-16 md:pb-24">
      <Container className="pt-8 md:pt-12">
        <p className="text-eyebrow">Каталог</p>
        <h1 className="mt-3 max-w-3xl font-serif text-[2.2rem] leading-[1.1] tracking-[-0.03em] md:text-[3rem]">
          26 адрес із характером Києва.
        </h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
          Публічна добірка квартир і будинків. На головній — коротке знайомство,
          тут — повний список із фільтрами. Підбір поза добіркою — після короткої
          розмови.
        </p>

        <div className="mt-10 md:mt-12">
          <Suspense
            fallback={
              <p className="text-sm text-ink-soft">Завантаження каталогу…</p>
            }
          >
            <CatalogBrowser properties={properties} districts={districts} />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
