/** Normalize UA phones to 380XXXXXXXXX */

export function normalizeUaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("380")) {
    return digits;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `38${digits}`;
  }
  if (digits.length === 9) {
    return `380${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("80")) {
    return `3${digits}`;
  }
  return digits;
}

export function isValidUaPhone(raw: string) {
  return /^380\d{9}$/.test(normalizeUaPhone(raw));
}
