import type {
  BodyType,
  EmissionClass,
  FuelType,
  ModelBadge,
  Transmission,
} from "@riflessi/shared";

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

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  PETROL: "Benzina",
  DIESEL: "Diesel",
  LPG: "GPL",
  CNG: "Metano",
  MILD_HYBRID: "Ibrida mild",
  HYBRID: "Ibrida full",
  PLUG_IN_HYBRID: "Ibrida plug-in",
  ELECTRIC: "Elettrica",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: "Manuale",
  AUTOMATIC: "Automatico",
};

export const EMISSION_CLASS_LABELS: Record<EmissionClass, string> = {
  EURO_4: "Euro 4",
  EURO_5: "Euro 5",
  EURO_6: "Euro 6",
  EURO_6D: "Euro 6d",
  EURO_6E: "Euro 6e",
  EURO_6E_BIS: "Euro 6e-bis",
  EURO_7: "Euro 7",
};

// 36900 → "36.900 €"
export function formatEur(value: number) {
  return value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

// "2026-09-15T00:00:00.000Z" → "set 2026"
export function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
