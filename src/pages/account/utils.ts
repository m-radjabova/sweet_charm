export function getInitials(name?: string | null) {
  if (!name) return "SC";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function normalizePhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
}

export function normalizePhoneForApi(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);
  return digits.length === 9 ? `+998${digits}` : "";
}

export function formatDisplayPhone(value?: string | null) {
  if (!value) return "+998 90 000 00 00";
  const digits = value.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);
  if (!digits) return value;
  return `+998 ${normalizePhoneInput(digits)}`;
}

export function formatDate(value?: string | null, fallback = "Recently") {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatMonthYear(value?: string | null) {
  if (!value) return "Sweet moments ahead";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sweet moments ahead";
  return parsed.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function deriveTier(points: number) {
  if (points >= 5000) return "Diamond Bunny";
  if (points >= 2500) return "Gold Bunny";
  if (points >= 1000) return "Silver Bunny";
  return "Bronze Bunny";
}

export function formatMoney(value?: string | number | null) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}
