import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminHome() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">
        Ciao, <span className="text-aura">{user?.name ?? "admin"}</span>
      </h1>
      <p className="text-muted">
        Da qui gestisci il catalogo: marche, modelli e versioni.
      </p>
      <Link
        href="/admin/marche"
        className="flex max-w-sm flex-col gap-1 rounded-2xl border border-border bg-card p-5 hover:border-fg/30"
      >
        <span className="font-display text-xl font-bold">Marche →</span>
        <span className="text-sm text-muted">
          Aggiungi e modifica le marche del catalogo
        </span>
      </Link>
    </div>
  );
}
