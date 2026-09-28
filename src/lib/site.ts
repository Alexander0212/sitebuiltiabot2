export const site = {
  name: "NOVA ESTATE",
  shortName: "NOVA",
  city: "Київ",
  url: "https://novaestate.ua",
  tagline: "Приватний підбір. Не каталог.",
  description:
    "NOVA ESTATE: приватне агентство в Києві. 30 хвилин розмови, потім короткий список під бюджет і ритм життя. У публічній добірці — 26 адрес: квартири та будинки.",
  email: "hello@novaestate.ua",
  phone: "+380 44 333 21 08",
  phoneHref: "tel:+380443332108",
  address: "вул. Велика Васильківська, 23, Київ",
  streetAddress: "вул. Велика Васильківська, 23",
  hours: "Пн-Сб · 10:00-19:00",
} as const;

export const primaryCta = {
  href: "/#contact",
  label: "Отримати свій підбір",
  shortLabel: "Підбір",
} as const;

export const navigation = [
  { href: "/#budget", label: "Бюджет" },
  { href: "/objects", label: "Об'єкти" },
  { href: "/#investments", label: "Інвестиції" },
  { href: "/#approach", label: "Підхід" },
  { href: "/#contact", label: "Контакт" },
] as const;

export const footerNavigation = [
  { href: "/objects", label: "Об'єкти" },
  { href: "/#budget", label: "Калькулятор" },
  { href: "/#investments", label: "Для інвестицій" },
  { href: "/#approach", label: "Про компанію" },
  { href: "/#contact", label: "Контакти" },
] as const;

export const districts = [
  "Поділ",
  "Печерськ",
  "Оболонь",
  "Центр",
  "Голосієво",
  "Осокорки",
  "Солом'янка",
  "Нивки",
  "Шулявка",
  "Деміївка",
  "Святошин",
  "Лівий берег",
  "Конча-Заспа",
  "Пуща-Водиця",
] as const;
