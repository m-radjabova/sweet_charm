const DISPLAY_OLD_PRICE_MULTIPLIER = 1.18;

export function getDisplayOldPrice(price?: string | number | null) {
  const numeric = Number(price ?? 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return (numeric * DISPLAY_OLD_PRICE_MULTIPLIER).toFixed(2);
}

export function getDisplayDiscountPercent(price?: string | number | null) {
  const numeric = Number(price ?? 0);
  const oldPrice = Number(getDisplayOldPrice(price));
  if (!Number.isFinite(numeric) || !Number.isFinite(oldPrice) || oldPrice <= numeric) return null;
  return Math.max(1, Math.round((1 - numeric / oldPrice) * 100));
}
