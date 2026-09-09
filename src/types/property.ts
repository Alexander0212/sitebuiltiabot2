export type PropertyBadge = "Нове" | "У добірці" | "−8%";

export type PropertyGalleryItem = {
  src: string;
  alt: string;
  caption: string;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  headline: string;
  district: string;
  city: string;
  priceUsd: number;
  areaM2: number;
  bedrooms: number;
  image: string;
  imageAlt: string;
  badge: PropertyBadge;
  forWhom: string;
  why: string;
  story: string;
  floor: string;
  year: string;
  plan: "two" | "three" | "four";
  gallery: PropertyGalleryItem[];
};
