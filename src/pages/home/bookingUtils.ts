export function formatDisplayDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

export function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayTime(time: string) {
  const [hoursText = "0", minutes = "00"] = time.split(":");
  const hours = Number(hoursText);
  const normalizedHours = hours % 12 || 12;
  const meridiem = hours >= 12 ? "PM" : "AM";
  return `${normalizedHours}:${minutes} ${meridiem}`;
}
