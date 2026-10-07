const SERIE_STATUS_LABELS: Record<string, string> = {
  "Returning Series": "En production",
  Ended: "Terminée",
  Canceled: "Annulée",
  "In Production": "En production",
  Planned: "Prévue",
  Pilot: "Pilote",
};

export function formatSerieStatus(status: string): string {
  return SERIE_STATUS_LABELS[status] ?? status;
}
