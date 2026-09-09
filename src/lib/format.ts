const usdFormatter = new Intl.NumberFormat("uk-UA", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const groupedFormatter = new Intl.NumberFormat("uk-UA", {
  maximumFractionDigits: 0,
});

function safeAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

export function formatUsd(value: number) {
  return usdFormatter.format(safeAmount(value));
}

export function formatUsdSymbol(value: number) {
  return `$${groupedFormatter.format(Math.round(safeAmount(value)))}`;
}

export function formatUsdMonthly(value: number) {
  return `${formatUsdSymbol(value)} / місяць`;
}

export function formatPercent(value: number) {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return `${safe.toFixed(2)}%`;
}

export function formatArea(value: number) {
  return `${value} м²`;
}

export function formatBedrooms(value: number) {
  if (value === 1) {
    return "1 спальня";
  }

  if (value >= 2 && value <= 4) {
    return `${value} спальні`;
  }

  return `${value} спалень`;
}

export function formatYears(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${value} рік`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${value} роки`;
  }

  return `${value} років`;
}
