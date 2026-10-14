import { BrandsManager } from "@/components/admin/brands-manager";
import { serverFetch } from "@/lib/server-api";
import type { Brand } from "@riflessi/shared";

export default async function AdminBrandsPage() {
  const brands = await serverFetch<Brand[]>("/api/brands");
  return <BrandsManager brands={brands ?? []} />;
}
