function toDate(value?: string | null) {
  if (!value) return null;

  const normalizedValue =
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatDate(value?: string | null, fallback = "Belgilanmagan") {
  const date = toDate(value);
  if (!date) return fallback;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function formatDateTime(value?: string | null, fallback = "Belgilanmagan") {
  const date = toDate(value);
  if (!date) return fallback;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${formatDate(value, fallback)} ${hours}:${minutes}`;
}

export function formatMonthYear(value?: string | null, fallback = "Belgilanmagan") {
  if (!value) return fallback;

  const match = value.match(/^(\d{4})-(\d{2})/);
  if (match) {
    return `${match[2]}.${match[1]}`;
  }

  const date = toDate(value);
  if (!date) return fallback;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}.${year}`;
}
