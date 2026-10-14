import type { BodyType, ModelBadge } from "./labels";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logoUrl: string | null;
  _count: { models: number };
}

export interface CarModelAdmin {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  bodyType: BodyType | null;
  description: string | null;
  launchedAt: string | null; // ISO date string from the API
  badge: ModelBadge | null;
  brand: { id: string; name: string };
  _count: { versions: number };
}
