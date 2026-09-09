export const heroContent = {
  eyebrow: "NOVA ESTATE · Київ",
  title: ["Квартира під вас.", "Без хаосу пошуку."] as const,
  subtitle:
    "Приватний підбір у Києві: замість десятків переглядів навмання ви отримуєте від 4 до 6 адрес під бюджет і свій ритм, і вже спокійно йдете дивитись.",
  primaryCta: {
    href: "/#contact",
    label: "Отримати свій підбір",
  },
  secondaryCta: {
    href: "/#objects",
    label: "Приклади адрес",
  },
} as const;

export const heroStats = [
  { value: 6, suffix: "", label: "адрес у списку" },
  { value: 1, suffix: "", label: "підбір, не каталог" },
  { value: 30, suffix: "", label: "хвилин до ясності" },
] as const;
