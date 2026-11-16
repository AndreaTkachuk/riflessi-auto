import { VersionsManager } from "@/components/admin/versions-manager";
import { serverFetch } from "@/lib/server-api";
import type { CarModelAdmin, CarVersionAdmin } from "@riflessi/shared";

export default async function AdminVersionsPage({
  searchParams,
}: {
  searchParams: Promise<{ modelId?: string | string[] }>;
}) {
  const [{ modelId }, versions, models] = await Promise.all([
    searchParams,
    serverFetch<CarVersionAdmin[]>("/api/admin/versions", { auth: true }),
    serverFetch<CarModelAdmin[]>("/api/admin/models", { auth: true }),
  ]);

  // ?modelId=... (link from the models table) preselects the filter.
  const initialModelId = typeof modelId === "string" ? modelId : undefined;

  return (
    <VersionsManager
      versions={versions ?? []}
      models={models ?? []}
      initialModelId={initialModelId}
    />
  );
}
