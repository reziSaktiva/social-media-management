const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Formats a past date as Indonesian relative time (e.g. "2 jam lalu"). */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < MINUTE) {
    return "baru saja";
  }
  if (diffMs < HOUR) {
    const minutes = Math.floor(diffMs / MINUTE);
    return `${minutes} menit lalu`;
  }
  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR);
    return `${hours} jam lalu`;
  }
  const days = Math.floor(diffMs / DAY);
  if (days === 1) {
    return "kemarin";
  }
  if (days < 7) {
    return `${days} hari lalu`;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
