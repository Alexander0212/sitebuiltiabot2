import type { Property, PropertyGalleryItem } from "@/types/property";

const shared = {
  salon: {
    src: "/images/living-salon.webp",
    alt: "Світла вітальня з деревом і видом на зелень",
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
    kind: "apartment",
    featured: true,
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
    kind: "apartment",
    featured: true,
    image: "/images/property-central-park.webp",
    imageAlt: "Вітальня Central Park Residence з вікнами на паркову зелень",
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
    kind: "apartment",
    featured: true,
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
    kind: "apartment",
    featured: true,
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
    kind: "apartment",
    featured: true,
    image: "/images/property-skyline.webp",
    imageAlt: "Квартира Skyline Apartment з м'яким вечірнім видом на місто",
    badge: "−8%",
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
    kind: "apartment",
    featured: true,
    image: "/images/property-terrace.webp",
    imageAlt: "Тераса Terrace House з видом на воду і зелень Осокорків",
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
  {
    id: "ne-07",
    slug: "brick-loft-podil",
    title: "Brick Loft Podil",
    headline: "1 спальня на Подолі, лофт",
    district: "Поділ",
    city: "Київ",
    priceUsd: 118000,
    areaM2: 48,
    bedrooms: 1,
    kind: "apartment",
    image: "/images/property-loft-podil.webp",
    imageAlt: "Лофт із цегляною стіною і високими вікнами на Подолі",
    badge: "Нове",
    forWhom: "Для одного або пари, хто хоче характерний інтер'єр і пішу відстань до набережної.",
    why: "Менше метрів, більше характеру. Поділ тут працює як стиль життя, не як інвестиційний слоган.",
    story:
      "Відкрита денна зона, спальня за скляною перегородкою. Добре, якщо вам важливі світло і фактура, а не зайві коридори.",
    floor: "3 з 6",
    year: "2016",
    plan: "studio",
    gallery: gallery(
      {
        src: "/images/property-loft-podil.webp",
        alt: "Лофт Brick Loft Podil",
        caption: "Інтер'єр",
      },
      [shared.street, shared.hero, shared.atelier, shared.salon, shared.water, shared.skyline],
    ),
  },
  {
    id: "ne-08",
    slug: "studio-arsenal",
    title: "Studio Arsenal",
    headline: "Студія в центрі, біля Арсеналу",
    district: "Центр",
    city: "Київ",
    priceUsd: 98000,
    areaM2: 36,
    bedrooms: 1,
    kind: "apartment",
    image: "/images/property-studio-center.webp",
    imageAlt: "Компактна світла студія в центрі Києва",
    badge: "−8%",
    forWhom: "Для стартового житла або лота під оренду з попитом на центр.",
    why: "Ціна входить у діапазон, де центр ще залишається раціональним. Не пентхаус — робоча адреса.",
    story:
      "Одна кімната зібрана навколо вікна. Мінімум зберігання, максимум світла. Підходить тим, хто живе містом, а не шафами.",
    floor: "8 з 18",
    year: "2015",
    plan: "studio",
    gallery: gallery(
      {
        src: "/images/property-studio-center.webp",
        alt: "Студія Studio Arsenal",
        caption: "Інтер'єр",
      },
      [shared.skyline, shared.street, shared.hero, shared.salon, shared.atelier, shared.water],
    ),
  },
  {
    id: "ne-09",
    slug: "solomyanka-line",
    title: "Solomyanka Line",
    headline: "2 спальні на Солом'янці",
    district: "Солом'янка",
    city: "Київ",
    priceUsd: 132000,
    areaM2: 64,
    bedrooms: 2,
    kind: "apartment",
    image: "/images/property-solomyanka.webp",
    imageAlt: "Сучасна квартира на Солом'янці зі світлою вітальнею",
    badge: "У добірці",
    forWhom: "Для пари, якій важливі вокзал, аеропорт і спокійний двір без центру.",
    why: "Солом'янка дає метро й ціну без націнки за «престижну» вивіску району.",
    story:
      "Дві спальні й окрема кухня-вітальня. Планування без зайвих кутів — зручно жити й здавати.",
    floor: "6 з 14",
    year: "2019",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-solomyanka.webp",
        alt: "Вітальня Solomyanka Line",
        caption: "Інтер'єр",
      },
      [shared.salon, shared.street, shared.hero, shared.atelier, shared.skyline, shared.water],
    ),
  },
  {
    id: "ne-10",
    slug: "nyvky-garden",
    title: "Nyvky Garden",
    headline: "3 спальні на Нивках",
    district: "Нивки",
    city: "Київ",
    priceUsd: 156000,
    areaM2: 88,
    bedrooms: 3,
    kind: "apartment",
    image: "/images/property-nyvky.webp",
    imageAlt: "Світла кухня-вітальня квартири на Нивках",
    badge: "Нове",
    forWhom: "Для сім'ї з дітьми, якій потрібен парк і школа поруч.",
    why: "Нивки тримають баланс: зелень, метро, ціна нижча за сусідній Святошин преміум-сегменту.",
    story:
      "Три кімнати з логічним поділом на день і ніч. Кухня винесена до вікна — ранок починається зі світла.",
    floor: "5 з 10",
    year: "2014",
    plan: "three",
    gallery: gallery(
      {
        src: "/images/property-nyvky.webp",
        alt: "Кухня Nyvky Garden",
        caption: "Кухня",
      },
      [shared.salon, shared.hero, shared.street, shared.atelier, shared.water, shared.skyline],
    ),
  },
  {
    id: "ne-11",
    slug: "shuliavka-loft",
    title: "Shuliavka Loft",
    headline: "2 спальні на Шулявці",
    district: "Шулявка",
    city: "Київ",
    priceUsd: 141000,
    areaM2: 72,
    bedrooms: 2,
    kind: "apartment",
    image: "/images/property-shuliavka.webp",
    imageAlt: "Відкрита вітальня на Шулявці з видом на зелень",
    badge: "У добірці",
    forWhom: "Для тих, хто працює на лівому й правому березі і хоче коротку дорогу в обидва боки.",
    why: "Шулявка зручна логістикою. Тут платите за доступність, а не за туристичну вітрину.",
    story:
      "Відкритий простір денної зони, дві спальні з окремими вікнами. Підходить і для життя, і під довгострокову оренду.",
    floor: "11 з 16",
    year: "2020",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-shuliavka.webp",
        alt: "Вітальня Shuliavka Loft",
        caption: "Інтер'єр",
      },
      [shared.hero, shared.salon, shared.street, shared.skyline, shared.atelier, shared.water],
    ),
  },
  {
    id: "ne-12",
    slug: "demiivka-quiet",
    title: "Demiivka Quiet",
    headline: "2 спальні на Деміївці",
    district: "Деміївка",
    city: "Київ",
    priceUsd: 127000,
    areaM2: 67,
    bedrooms: 2,
    kind: "apartment",
    image: "/images/property-demiivka.webp",
    imageAlt: "Спальня на Деміївці з вікном у зелений двір",
    badge: "Нове",
    forWhom: "Для пари, якій потрібен тихий двір і швидкий виїзд на Одеську трасу.",
    why: "Деміївка дає ціну без ілюзії «майже центр». Реальний комфорт за зрозумілі гроші.",
    story:
      "Спальня й кабінет розділені чітко. Вітальня без зайвого скління — тепло взимку відчувається одразу.",
    floor: "4 з 9",
    year: "2013",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-demiivka.webp",
        alt: "Спальня Demiivka Quiet",
        caption: "Спальня",
      },
      [shared.salon, shared.atelier, shared.hero, shared.street, shared.water, shared.skyline],
    ),
  },
  {
    id: "ne-13",
    slug: "leftbank-horizon",
    title: "Leftbank Horizon",
    headline: "3 спальні на Лівому березі",
    district: "Лівий берег",
    city: "Київ",
    priceUsd: 168000,
    areaM2: 92,
    bedrooms: 3,
    kind: "apartment",
    image: "/images/property-leftbank.webp",
    imageAlt: "Простора вітальня на Лівому березі з теплим світлом",
    badge: "У добірці",
    forWhom: "Для сім'ї, яка живе й працює на лівому березі й не хоче щодня їхати через міст.",
    why: "Метраж і планування тут дешевші за симетричний лот на правому березі. Логіка проста — менше дороги.",
    story:
      "Три спальні й велика денна зона. Добре, якщо дітям потрібні окремі кімнати без компромісу в кухні.",
    floor: "12 з 25",
    year: "2021",
    plan: "three",
    gallery: gallery(
      {
        src: "/images/property-leftbank.webp",
        alt: "Вітальня Leftbank Horizon",
        caption: "Інтер'єр",
      },
      [shared.skyline, shared.salon, shared.water, shared.hero, shared.street, shared.atelier],
    ),
  },
  {
    id: "ne-14",
    slug: "svyatoshyn-park",
    title: "Svyatoshyn Park",
    headline: "2 спальні у Святошині",
    district: "Святошин",
    city: "Київ",
    priceUsd: 138000,
    areaM2: 70,
    bedrooms: 2,
    kind: "apartment",
    image: "/images/property-svyatoshyn.webp",
    imageAlt: "Світла спальня у Святошині з великим вікном",
    badge: "Нове",
    forWhom: "Для тих, хто цінує парк, тишу й метро без шуму центру.",
    why: "Святошин тримає попит через зелень і стабільну оренду. Не хайп — робочий район.",
    story:
      "Дві спальні з окремими вікнами, кухня з місцем для столу. Підходить для життя й як лот під дохід.",
    floor: "7 з 12",
    year: "2018",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-svyatoshyn.webp",
        alt: "Спальня Svyatoshyn Park",
        caption: "Спальня",
      },
      [shared.salon, shared.hero, shared.atelier, shared.street, shared.water, shared.skyline],
    ),
  },
  {
    id: "ne-15",
    slug: "obolon-light",
    title: "Obolon Light",
    headline: "1 спальня на Оболоні, світла",
    district: "Оболонь",
    city: "Київ",
    priceUsd: 112000,
    areaM2: 52,
    bedrooms: 1,
    kind: "apartment",
    image: "/images/property-obolon-light.webp",
    imageAlt: "Світла квартира на Оболоні з мінімалістичним інтер'єром",
    badge: "−8%",
    forWhom: "Для одного або пари на старті, хто хоче воду й новий будинок.",
    why: "Ціна нижча за сусідні лоти через компактне планування. Оболонь тут — про повітря, не про статус.",
    story:
      "Одна спальня й відкрита кухня. Великі вікна знімають відчуття малої площі.",
    floor: "15 з 22",
    year: "2022",
    plan: "studio",
    gallery: gallery(
      {
        src: "/images/property-obolon-light.webp",
        alt: "Вітальня Obolon Light",
        caption: "Інтер'єр",
      },
      [shared.water, shared.salon, shared.hero, shared.skyline, shared.street, shared.atelier],
    ),
  },
  {
    id: "ne-16",
    slug: "pechersk-quiet",
    title: "Pechersk Quiet",
    headline: "2 спальні на Печерську, тихий двір",
    district: "Печерськ",
    city: "Київ",
    priceUsd: 246000,
    areaM2: 84,
    bedrooms: 2,
    kind: "apartment",
    image: "/images/property-pechersk-quiet.webp",
    imageAlt: "Тиха вітальня на Печерську з видом у зелений двір",
    badge: "У добірці",
    forWhom: "Для пари, якій важливі тиша двору й статус району без пентхаусу.",
    why: "Печерськ тримає ліквідність. Тут платите за адресу, яка легко здається й продається.",
    story:
      "Дві спальні, якісна денна зона, вікна у двір. Без шуму проспекту — це вже половина вартості.",
    floor: "6 з 11",
    year: "2019",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-pechersk-quiet.webp",
        alt: "Вітальня Pechersk Quiet",
        caption: "Інтер'єр",
      },
      [shared.atelier, shared.salon, shared.hero, shared.street, shared.skyline, shared.water],
    ),
  },
  {
    id: "ne-17",
    slug: "podil-brick",
    title: "Podil Brick",
    headline: "3 спальні на Подолі, цегла",
    district: "Поділ",
    city: "Київ",
    priceUsd: 212000,
    areaM2: 101,
    bedrooms: 3,
    kind: "apartment",
    image: "/images/property-podil-brick.webp",
    imageAlt: "Сучасний інтер'єр з теплим деревом на Подолі",
    badge: "Нове",
    forWhom: "Для сім'ї, яка хоче Поділ і метраж без компромісу в третій кімнаті.",
    why: "Рідкісне поєднання району й площі. На Подолі такі лоти тримають чергу переглядів.",
    story:
      "Три спальні, високі стелі, денна зона з характером. Це вже сімейний формат у історичному районі.",
    floor: "4 з 7",
    year: "2020",
    plan: "three",
    gallery: gallery(
      {
        src: "/images/property-podil-brick.webp",
        alt: "Інтер'єр Podil Brick",
        caption: "Інтер'єр",
      },
      [shared.street, shared.water, shared.salon, shared.hero, shared.atelier, shared.skyline],
    ),
  },
  {
    id: "ne-18",
    slug: "center-gallery",
    title: "Center Gallery",
    headline: "2 спальні в центрі, галерейний план",
    district: "Центр",
    city: "Київ",
    priceUsd: 198000,
    areaM2: 76,
    bedrooms: 2,
    kind: "apartment",
    image: "/images/property-center-gallery.webp",
    imageAlt: "Дизайнерська вітальня в центрі з мистецтвом на стінах",
    badge: "У добірці",
    forWhom: "Для тих, хто хоче центр і інтер'єр, а не лише вид з вікна.",
    why: "Планування зібране навколо світла. У центрі це рідкість без переплати за зайвий метр.",
    story:
      "Дві спальні й довга вітальня. Добре для життя й прийому гостей без відчуття «прохідного двора».",
    floor: "9 з 16",
    year: "2018",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-center-gallery.webp",
        alt: "Вітальня Center Gallery",
        caption: "Інтер'єр",
      },
      [shared.hero, shared.skyline, shared.street, shared.atelier, shared.salon, shared.water],
    ),
  },
  {
    id: "ne-19",
    slug: "osokorky-view",
    title: "Osokorky View",
    headline: "3 спальні на Осокорках, вид",
    district: "Осокорки",
    city: "Київ",
    priceUsd: 186000,
    areaM2: 98,
    bedrooms: 3,
    kind: "apartment",
    image: "/images/property-osokorky-view.webp",
    imageAlt: "Вітальня на Осокорках з видом на зелень за вікном",
    badge: "Нове",
    forWhom: "Для сім'ї, якій потрібен простір і вода без ціни Печерська.",
    why: "Осокорки дають метраж і вид. Якщо тиждень вміщає дітей і озеро — логіка очевидна.",
    story:
      "Три спальні, балкон з перспективою. Будинок новий — менше сюрпризів у комунальних витратах.",
    floor: "10 з 18",
    year: "2023",
    plan: "three",
    gallery: gallery(
      {
        src: "/images/property-osokorky-view.webp",
        alt: "Вид Osokorky View",
        caption: "Інтер'єр",
      },
      [shared.water, shared.salon, shared.skyline, shared.hero, shared.street, shared.atelier],
    ),
  },
  {
    id: "ne-20",
    slug: "holosiiv-green",
    title: "Holosiiv Green",
    headline: "2 спальні в Голосієві, до парку",
    district: "Голосіївський район",
    city: "Київ",
    priceUsd: 154000,
    areaM2: 74,
    bedrooms: 2,
    kind: "apartment",
    image: "/images/property-holosiiv-green.webp",
    imageAlt: "Вітальня в Голосієві з вікном на паркові дерева",
    badge: "У добірці",
    forWhom: "Для пари, якій важливі повітря й greenery без виїзду за місто.",
    why: "Голосіїв тримає попит через парк. Це ставка на якість буднів, не на вивіску району.",
    story:
      "Дві спальні й тиха денна зона. Вікна в зелень знімають відчуття щільної забудови.",
    floor: "3 з 9",
    year: "2017",
    plan: "two",
    gallery: gallery(
      {
        src: "/images/property-holosiiv-green.webp",
        alt: "Інтер'єр Holosiiv Green",
        caption: "Інтер'єр",
      },
      [shared.salon, shared.hero, shared.water, shared.atelier, shared.street, shared.skyline],
    ),
  },
  {
    id: "ne-21",
    slug: "koncha-zaseka-house",
    title: "Koncha Zaspa House",
    headline: "Будинок у Конча-Заспі, 4 спальні",
    district: "Конча-Заспа",
    city: "Київська область",
    priceUsd: 420000,
    areaM2: 220,
    bedrooms: 4,
    kind: "house",
    image: "/images/house-koncha.webp",
    imageAlt: "Сучасний двоповерховий будинок у Конча-Заспі",
    badge: "Будинок",
    forWhom: "Для сім'ї, якій потрібен двір, тиша й приватність без відмови від Києва.",
    why: "Конча-Заспа тримає попит на формат «життя за містом із короткою дорогою в центр».",
    story:
      "Два рівні, велика вітальня, двір під дітей і вечори. Це вже не квартира з терасою — окремий ритм.",
    floor: "2 рівні",
    year: "2021",
    plan: "house",
    gallery: gallery(
      {
        src: "/images/house-koncha.webp",
        alt: "Фасад Koncha Zaspa House",
        caption: "Фасад",
      },
      [shared.water, shared.salon, shared.hero, shared.atelier, shared.skyline, shared.street],
    ),
  },
  {
    id: "ne-22",
    slug: "pushcha-voditsa-villa",
    title: "Pushcha Villa",
    headline: "Вілла в Пущі-Водиці, 5 спалень",
    district: "Пуща-Водиця",
    city: "Київська область",
    priceUsd: 510000,
    areaM2: 280,
    bedrooms: 5,
    kind: "house",
    image: "/images/house-pushcha.webp",
    imageAlt: "Сучасна вілла серед сосен у Пущі-Водиці",
    badge: "Будинок",
    forWhom: "Для великої сім'ї або тих, хто хоче простір під гостей і відпочинок вдома.",
    why: "Пуща дає ліс і приватність. Бюджет відповідає формату вілли, а не «будинку на ділянці».",
    story:
      "Простора денна зона, сосновий двір, кімнати для сім'ї й гостей. Життя зібране навколо ділянки, не під'їзду.",
    floor: "2 рівні",
    year: "2022",
    plan: "house",
    gallery: gallery(
      {
        src: "/images/house-pushcha.webp",
        alt: "Фасад Pushcha Villa",
        caption: "Фасад",
      },
      [shared.water, shared.salon, shared.hero, shared.skyline, shared.atelier, shared.street],
    ),
  },
  {
    id: "ne-23",
    slug: "osokorky-cottage",
    title: "Osokorky Cottage",
    headline: "Котедж на Осокорках, 4 спальні",
    district: "Осокорки",
    city: "Київ",
    priceUsd: 345000,
    areaM2: 185,
    bedrooms: 4,
    kind: "house",
    image: "/images/house-osokorky.webp",
    imageAlt: "Сучасний котедж із великими вікнами на Осокорках",
    badge: "Будинок",
    forWhom: "Для сім'ї, яка хоче будинок у місті й воду поруч.",
    why: "Осокорки дозволяють формат котеджу без виїзду далеко за Кільцеву.",
    story:
      "Чотири спальні, відкрита вітальня, ділянка під вечори. Місто поруч — без відчуття дачного селища.",
    floor: "2 рівні",
    year: "2020",
    plan: "house",
    gallery: gallery(
      {
        src: "/images/house-osokorky.webp",
        alt: "Фасад Osokorky Cottage",
        caption: "Фасад",
      },
      [shared.water, shared.salon, shared.skyline, shared.hero, shared.street, shared.atelier],
    ),
  },
  {
    id: "ne-24",
    slug: "bortnychi-family",
    title: "Bortnychi Family",
    headline: "Сімейний будинок у Бортничах",
    district: "Бортничі",
    city: "Київ",
    priceUsd: 278000,
    areaM2: 160,
    bedrooms: 4,
    kind: "house",
    image: "/images/house-bortnychi.webp",
    imageAlt: "Сімейний будинок із газоном і парканом у Бортничах",
    badge: "Будинок",
    forWhom: "Для сім'ї з дітьми, якій потрібен двір і зрозумілий бюджет.",
    why: "Бортничі дають метраж і ділянку дешевше за Кончу. Компроміс зрозумілий і чесний.",
    story:
      "Два рівні, двір під ігри, гараж. Будинок зібраний під будні сім'ї, не під фотосесію.",
    floor: "2 рівні",
    year: "2019",
    plan: "house",
    gallery: gallery(
      {
        src: "/images/house-bortnychi.webp",
        alt: "Фасад Bortnychi Family",
        caption: "Фасад",
      },
      [shared.salon, shared.hero, shared.water, shared.street, shared.atelier, shared.skyline],
    ),
  },
  {
    id: "ne-25",
    slug: "vita-poshtova-house",
    title: "Vita Poshtova House",
    headline: "Будинок у Віті-Поштовій, 3 спальні",
    district: "Віта-Поштова",
    city: "Київська область",
    priceUsd: 295000,
    areaM2: 145,
    bedrooms: 3,
    kind: "house",
    image: "/images/house-vita.webp",
    imageAlt: "Сучасний будинок із двором і огорожею у Віті-Поштовій",
    badge: "Будинок",
    forWhom: "Для пари або невеликої сім'ї, яка хоче сад і тишу за 20–30 хвилин від міста.",
    why: "Віта-Поштова дає приватність і ціну нижчу за преміум-сегмент Кончі.",
    story:
      "Три спальні, сад, спокійний фасад. Підходить тим, хто готовий жити за містом без відриву від Києва.",
    floor: "2 рівні",
    year: "2016",
    plan: "house",
    gallery: gallery(
      {
        src: "/images/house-vita.webp",
        alt: "Фасад Vita Poshtova House",
        caption: "Фасад",
      },
      [shared.salon, shared.water, shared.hero, shared.atelier, shared.street, shared.skyline],
    ),
  },
  {
    id: "ne-26",
    slug: "hatne-modern",
    title: "Hatne Modern",
    headline: "Сучасний будинок у Гатном, 4 спальні",
    district: "Гатне",
    city: "Київська область",
    priceUsd: 318000,
    areaM2: 175,
    bedrooms: 4,
    kind: "house",
    image: "/images/house-hatne.webp",
    imageAlt: "Сучасний білий будинок із плоским дахом у Гатном",
    badge: "Будинок",
    forWhom: "Для сім'ї, якій важливі сучасна архітектура й двір без щільної міської забудови.",
    why: "Гатне близько до Києва й дає формат нового будинку без ціни Конча-Заспи.",
    story:
      "Чотири спальні, відкрита вітальня, чисті лінії фасаду. Будинок під довге життя, не під сезонну дачу.",
    floor: "2 рівні",
    year: "2023",
    plan: "house",
    gallery: gallery(
      {
        src: "/images/house-hatne.webp",
        alt: "Фасад Hatne Modern",
        caption: "Фасад",
      },
      [shared.salon, shared.hero, shared.skyline, shared.atelier, shared.water, shared.street],
    ),
  },
];

export function getFeaturedProperties(count = 6) {
  const featured = properties.filter((property) => property.featured);
  if (featured.length >= count) {
    return featured.slice(0, count);
  }
  return properties.slice(0, count);
}

export function getPropertyBySlug(slug: string) {
  return properties.find((property) => property.slug === slug);
}

export function getPropertyHref(slug: string) {
  return `/objects/${slug}`;
}

export function getCatalogHref(params?: Record<string, string>) {
  if (!params || Object.keys(params).length === 0) {
    return "/objects";
  }
  const query = new URLSearchParams(params).toString();
  return `/objects?${query}`;
}

export function getPropertyDistricts() {
  return [...new Set(properties.map((property) => property.district))].sort(
    (a, b) => a.localeCompare(b, "uk"),
  );
}

export type CatalogFilters = {
  kind?: "apartment" | "house" | "all";
  district?: string;
  bedrooms?: number | "4plus" | "all";
  budget?: "all" | "under150" | "under200" | "under250" | "over250";
};

export function filterProperties(
  list: Property[],
  filters: CatalogFilters,
): Property[] {
  return list.filter((property) => {
    if (filters.kind && filters.kind !== "all" && property.kind !== filters.kind) {
      return false;
    }

    if (filters.district && filters.district !== "all") {
      if (property.district !== filters.district) {
        return false;
      }
    }

    if (filters.bedrooms && filters.bedrooms !== "all") {
      if (filters.bedrooms === "4plus") {
        if (property.bedrooms < 4) return false;
      } else if (property.bedrooms !== filters.bedrooms) {
        return false;
      }
    }

    if (filters.budget && filters.budget !== "all") {
      const price = property.priceUsd;
      if (filters.budget === "under150" && price > 150000) return false;
      if (filters.budget === "under200" && price > 200000) return false;
      if (filters.budget === "under250" && price > 250000) return false;
      if (filters.budget === "over250" && price <= 250000) return false;
    }

    return true;
  });
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
    .sort((a, b) => {
      const kindBoost = (property: Property) =>
        property.kind === current.kind ? 0 : 40_000;
      return (
        Math.abs(a.priceUsd - current.priceUsd) +
        kindBoost(a) -
        (Math.abs(b.priceUsd - current.priceUsd) + kindBoost(b))
      );
    })
    .slice(0, count);
}
