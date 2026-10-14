export const BODY_TYPE_LABELS = {
  HATCHBACK: "Hatchback",
  SEDAN: "Berlina",
  WAGON: "Station wagon",
  SUV: "SUV",
  COUPE: "Coupé",
  CONVERTIBLE: "Cabrio",
  MPV: "Monovolume",
  PICKUP: "Pick-up",
  VAN: "Furgone",
} as const;

export type BodyType = keyof typeof BODY_TYPE_LABELS;

export const BADGE_LABELS = {
  NEW_MODEL: "Novità",
  NEW_GENERATION: "Nuova generazione",
  FACELIFT: "Restyling",
} as const;

export type ModelBadge = keyof typeof BADGE_LABELS;

// "2026-09-15T00:00:00.000Z" → "set 2026"
export function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
