import type { BodyType, ModelBadge } from "@riflessi/shared";

// Record<Enum, string>: a new enum value without an Italian label is a compile error.
export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  HATCHBACK: "Hatchback",
  SEDAN: "Berlina",
  WAGON: "Station wagon",
  SUV: "SUV",
  COUPE: "Coupé",
  CONVERTIBLE: "Cabrio",
  MPV: "Monovolume",
  PICKUP: "Pick-up",
  VAN: "Furgone",
};

export const BADGE_LABELS: Record<ModelBadge, string> = {
  NEW_MODEL: "Novità",
  NEW_GENERATION: "Nuova generazione",
  FACELIFT: "Restyling",
};

// "2026-09-15T00:00:00.000Z" → "set 2026"
export function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
