"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiError } from "@/lib/api-error";
import type { Brand } from "@/lib/types";
import { BrandForm } from "./brand-form";

type Panel = { mode: "create" } | { mode: "edit"; brand: Brand } | null;

export function BrandsManager({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = brands.filter((b) => b.name.toLowerCase().includes(q));

  function handleDone() {
    setPanel(null);
    setError(null);
    router.refresh();
  }

  async function handleDelete(brand: Brand) {
    if (!confirm(`Eliminare la marca "${brand.name}"?`)) return;

    setDeletingId(brand.id);
    setError(null);
    const res = await fetch(`/api/admin/brands/${brand.id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!res.ok) {
      setError(await readApiError(res));
      return;
    }
    if (panel?.mode === "edit" && panel.brand.id === brand.id) setPanel(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Catalogo / Marche</p>
          <h1 className="font-display text-3xl font-bold">Marche</h1>
        </div>
        <button
          type="button"
          onClick={() => setPanel({ mode: "create" })}
          className="bg-aura-shimmer animate-shimmer rounded-xl px-5 py-3 font-extrabold text-white motion-reduce:animate-none"
        >
          + Nuova marca
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <section className="min-w-0 flex-1 basis-[28rem] overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <label className="flex max-w-xs flex-col gap-2 text-sm font-semibold text-muted">
              Cerca marca
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="es. Fiat"
                className="rounded-xl border border-border bg-transparent px-4 py-2.5 text-base text-fg outline-none focus:border-fg/40"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <thead className="text-sm text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Paese</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Modelli
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-4 py-3 font-bold">{b.name}</td>
                    <td className="px-4 py-3 font-mono text-sm text-muted">
                      {b.slug}
                    </td>
                    <td className="px-4 py-3">{b.country ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {b._count.models}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setPanel({ mode: "edit", brand: b })}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b)}
                        disabled={deletingId === b.id}
                        className="ml-2 rounded-lg border border-border px-3 py-1.5 text-sm text-red-500 disabled:opacity-50"
                      >
                        {deletingId === b.id ? "…" : "Elimina"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted"
                    >
                      {brands.length === 0
                        ? "Nessuna marca. Aggiungi la prima!"
                        : "Nessun risultato."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="border-t border-border px-4 py-3 text-sm text-muted">
            {filtered.length} di {brands.length} marche
          </p>
        </section>

        {panel && (
          <BrandForm
            key={panel.mode === "edit" ? panel.brand.id : "new"}
            brand={panel.mode === "edit" ? panel.brand : undefined}
            onDone={handleDone}
            onCancel={() => setPanel(null)}
          />
        )}
      </div>
    </div>
  );
}
