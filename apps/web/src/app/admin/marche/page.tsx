import { BrandsManager } from "@/components/admin/brands-manager";
import { serverFetch } from "@/lib/server-api";
import type { Brand } from "@/lib/types";

export default async function AdminBrandsPage() {
  const brands = await serverFetch<Brand[]>("/api/brands");
  return <BrandsManager brands={brands ?? []} />;
}
