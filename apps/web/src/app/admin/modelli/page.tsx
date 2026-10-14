import { ModelsManager } from "@/components/admin/models-manager";
import { serverFetch } from "@/lib/server-api";
import type { Brand, CarModelAdmin } from "@/lib/types";

export default async function AdminModelsPage() {
  const [models, brands] = await Promise.all([
    serverFetch<CarModelAdmin[]>("/api/admin/models", { auth: true }),
    serverFetch<Brand[]>("/api/brands"),
  ]);

  return <ModelsManager models={models ?? []} brands={brands ?? []} />;
}
