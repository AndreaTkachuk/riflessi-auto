import type {
  BodyType,
  EmissionClass,
  FuelType,
  ModelBadge,
  Transmission,
} from './enums.js';

// API response shapes as they arrive in JSON: dates are ISO strings, Decimal is a string.

// GET /api/brands
export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logoUrl: string | null;
  _count: { models: number };
}

// GET /api/admin/models
export interface CarModelAdmin {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  bodyType: BodyType | null;
  description: string | null;
  launchedAt: string | null;
  badge: ModelBadge | null;
  brand: { id: string; name: string };
  _count: { versions: number };
}

// GET /api/admin/versions
export interface CarVersionAdmin {
  id: string;
  modelId: string;
  name: string;
  slug: string;
  yearFrom: number;
  yearTo: number | null;
  fuelType: FuelType;
  transmission: Transmission;
  engineCc: number | null;
  powerKw: number | null;
  powerHp: number | null;
  consumption: string | null; // Decimal(4,1), e.g. "5.4"
  co2Gkm: number | null;
  batteryKwh: string | null; // Decimal(4,1), e.g. "44" or "52.5"
  rangeKm: number | null;
  emissionClass: EmissionClass | null;
  doors: number | null;
  seats: number | null;
  priceNewEur: number | null;
  createdAt: string;
  updatedAt: string;
  model: { id: string; name: string; brand: { id: string; name: string } };
}
