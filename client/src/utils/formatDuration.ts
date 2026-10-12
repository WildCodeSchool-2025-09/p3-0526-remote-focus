export function formatDuration(minutes: number | null): string {
  if (minutes == null || minutes <= 0) {
    return "";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours} h ${String(remainingMinutes).padStart(2, "0")}`;
}
