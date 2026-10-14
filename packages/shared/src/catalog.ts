import type { BodyType, ModelBadge } from './enums.js';

// API response shapes as they arrive in JSON: dates are ISO strings.

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
