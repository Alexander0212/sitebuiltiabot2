import type { Property, PropertyGalleryItem } from "@/types/property";

const shared = {
  salon: {
    src: "/images/living-salon.webp",
    alt: "Світла вітальня з льном і денним світлом",
    caption: "Як може виглядати будень",
  },
  street: {
    src: "/images/kyiv-street.webp",
    alt: "Вечірня вулиця Києва з класичними фасадами",
    caption: "Район",
  },
  water: {
    src: "/images/kyiv-water.webp",
    alt: "Вид на воду з тераси",
    caption: "Вид",
  },
  skyline: {
    src: "/images/kyiv-skyline.webp",
    alt: "Вечірній горизонт Києва",
    caption: "Місто",
  },
  atelier: {
    src: "/images/atelier-interior.webp",
    alt: "Тихий інтер'єр із деревом і бронзою",
    caption: "Матеріали",
  },
  hero: {
    src: "/images/hero.webp",
    alt: "Інтер'єр з панорамними вікнами і теплим деревом",
    caption: "Світло",
  },
} as const satisfies Record<string, PropertyGalleryItem>;

function gallery(
  own: PropertyGalleryItem,
  extras: PropertyGalleryItem[],
): PropertyGalleryItem[] {
  return [own, ...extras];
}

export const properties: Property[] = [
  {
    id: "ne-01",
    slug: "riverside-residence",
    title: "Riverside Residence",
    headline: "2 спальні на Подолі, до річки",
    district: "Поділ",
    city: "Київ",
    priceUsd: 164000,
    areaM2: 78,
    bedrooms: 2,
    image: "/images/property-riverside.webp",
    imageAlt:
      "Інтер'єр Riverside Residence: великі вікна з видом на річку, тепле дерево і цегла",
    badge: "Нове",
    forWhom: "Для пари або молодої сім'ї, якій важливі піша доступність і вода поруч.",
    why: "Поділ тримає ціну не через статус у брошурі, а через ритм: робота, набережна, короткі дистанції.",
    story:
      "Квартира зібрана навколо вікон на річку. Не для показу гостям, а для вечорів, коли не хочеться нікуди їхати.",
    floor: "7 з 12",
    year: "2021",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-riverside.webp",
        alt: "Вітальня Riverside Residence з видом на річку",
        caption: "Інтер'єр",
      },
      [shared.water, shared.street, shared.salon, shared.hero, shared.atelier, shared.skyline],
    ),
  },
  {
    id: "ne-02",
    slug: "central-park-residence",
    title: "Central Park Residence",
    headline: "3 спальні на Печерську, до парку",
    district: "Печерськ",
    city: "Київ",
    priceUsd: 228000,
    areaM2: 96,
    bedrooms: 3,
    image: "/images/property-central-park.webp",
    imageAlt: "Вітальня Central Park Residence з панорамними вікнами на парк",
    badge: "У добірці",
    forWhom: "Для сім'ї, якій потрібні тиша двору і школа в пішій доступності.",
    why: "Тут платите не за центр на карті, а за те, що ранок не починається з корка.",
    story:
      "Велика вітальня дивиться в зелень. Третя кімната стає кабінетом або дитячою, без компромісу через коридор.",
    floor: "5 з 9",
    year: "2019",
    plan: "three",
    gallery: gallery(
      {
        src: "/images/property-central-park.webp",
        alt: "Вітальня Central Park Residence з вікнами на парк",
        caption: "Інтер'єр",
      },
      [shared.salon, shared.hero, shared.street, shared.atelier, shared.skyline, shared.water],
    ),
  },
  {
    id: "ne-03",
    slug: "lake-house",
    title: "Lake House",
    headline: "2 спальні на Оболоні, до озера",
    district: "Оболонь",
    city: "Київ",
    priceUsd: 149000,
    areaM2: 71,
    bedrooms: 2,
    image: "/images/property-lake.webp",
    imageAlt: "Сучасна вітальня Lake House з видом на озеро",
    badge: "Нове",
    forWhom: "Для тих, хто хоче воду і повітря, не віддаючи весь бюджет за Печерськ.",
    why: "Оболонь дає метраж і вид, який у центрі коштував би інакше. Місячний комфорт тут важливіший за адресу в Instagram.",
    story:
      "Планування просте: денна зона до скла, спальня відгороджена. Добре живеться, якщо тиждень не крутиться лише навколо Хрещатика.",
    floor: "9 з 16",
    year: "2020",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-lake.webp",
        alt: "Вітальня Lake House з видом на озеро",
        caption: "Інтер'єр",
      },
      [shared.water, shared.salon, shared.skyline, shared.hero, shared.street, shared.atelier],
    ),
  },
  {
    id: "ne-04",
    slug: "forest-residence",
    title: "Forest Residence",
    headline: "3 спальні в Голосієві, до лісу",
    district: "Голосіївський район",
    city: "Київ",
    priceUsd: 194000,
    areaM2: 104,
    bedrooms: 3,
    image: "/images/property-forest.webp",
    imageAlt: "Інтер'єр Forest Residence з вікнами в ліс",
    badge: "У добірці",
    forWhom: "Для сім'ї, якій потрібен простір і тиша, а не життя в епіцентрі.",
    why: "Голосіїв тримає попит через парк і повітря. Це ставка на те, як ви житимете через п'ять років, не лише на перепродаж завтра.",
    story:
      "Чотири кімнати без зайвих коридорів. Вікна в зелень знімають відчуття, що ви в панельному місті.",
    floor: "4 з 8",
    year: "2018",
    plan: "three",
    gallery: gallery(
      {
        src: "/images/property-forest.webp",
        alt: "Інтер'єр Forest Residence з вікнами в ліс",
        caption: "Інтер'єр",
      },
      [shared.salon, shared.hero, shared.water, shared.atelier, shared.street, shared.skyline],
    ),
  },
  {
    id: "ne-05",
    slug: "skyline-apartment",
    title: "Skyline Apartment",
    headline: "2 спальні в центрі, з видом на місто",
    district: "Центр",
    city: "Київ",
    priceUsd: 178000,
    areaM2: 69,
    bedrooms: 2,
    image: "/images/property-skyline.webp",
    imageAlt: "Квартира Skyline Apartment з видом на міський горизонт",
    badge: "-8%",
    forWhom: "Для тих, хто працює в центрі й не хоче віддавати вечір дорозі.",
    why: "Ціна нижча за сусідні лоти через планування без зайвого метражу. Якщо вам не потрібна третя кімната, це раціональний центр, а не знижка заради знижки.",
    story:
      "Компактна денна зона й два вікна на горизонт. Добре як основне житло для двох або як квартира з орендним попитом.",
    floor: "14 з 24",
    year: "2017",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-skyline.webp",
        alt: "Skyline Apartment з видом на горизонт",
        caption: "Інтер'єр",
      },
      [shared.skyline, shared.hero, shared.street, shared.atelier, shared.salon, shared.water],
    ),
  },
  {
    id: "ne-06",
    slug: "terrace-house",
    title: "Terrace House",
    headline: "4 спальні на Осокорках, з терасою",
    district: "Осокорки",
    city: "Київ",
    priceUsd: 265000,
    areaM2: 132,
    bedrooms: 4,
    image: "/images/property-terrace.webp",
    imageAlt: "Тераса Terrace House з видом на місто і воду",
    badge: "У добірці",
    forWhom: "Для великої сім'ї, якій потрібні кімнати й повітря, а не статус центру.",
    why: "Осокорки дають терасу й метраж, який у Печерську розриває бюджет. Якщо тиждень вміщає воду, дітей і гостей, логіка інша, ніж лише центр.",
    story:
      "Перший рівень для життя сім'ї, тераса як окрема кімната без стін. Це вже не квартира на показ, а формат будинку в місті.",
    floor: "2 з 4",
    year: "2022",
    plan: "four",
    gallery: gallery(
      {
        src: "/images/property-terrace.webp",
        alt: "Тераса Terrace House з видом на воду",
        caption: "Тераса",
      },
      [shared.water, shared.salon, shared.skyline, shared.hero, shared.street, shared.atelier],
    ),
  },
];

export function getPropertyBySlug(slug: string) {
  return properties.find((property) => property.slug === slug);
}

export function getPropertyHref(slug: string) {
  return `/objects/${slug}`;
}

export function matchProperties(budget: number) {
  const under = properties
    .filter((property) => property.priceUsd <= budget * 1.05)
    .sort((a, b) => b.priceUsd - a.priceUsd);

  if (under.length >= 2) {
    const rest = properties
      .filter((property) => !under.includes(property))
      .sort(
        (a, b) =>
          Math.abs(a.priceUsd - budget) - Math.abs(b.priceUsd - budget),
      );
    return [...under, ...rest].slice(0, 3);
  }

  return [...properties]
    .sort(
      (a, b) =>
        Math.abs(a.priceUsd - budget) - Math.abs(b.priceUsd - budget),
    )
    .slice(0, 3);
}

export function getRelatedProperties(slug: string, count = 2) {
  const current = getPropertyBySlug(slug);

  if (!current) {
    return properties.slice(0, count);
  }

  return properties
    .filter((property) => property.slug !== slug)
    .sort(
      (a, b) =>
        Math.abs(a.priceUsd - current.priceUsd) -
        Math.abs(b.priceUsd - current.priceUsd),
    )
    .slice(0, count);
}
