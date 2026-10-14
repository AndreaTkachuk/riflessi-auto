"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiError } from "@/lib/api-error";
import { BADGE_LABELS, BODY_TYPE_LABELS, formatMonthYear } from "@/lib/labels";
import type { Brand, CarModelAdmin } from "@/lib/types";
import { ModelForm } from "./model-form";

type Panel = { mode: "create" } | { mode: "edit"; model: CarModelAdmin } | null;

export function ModelsManager({
  models,
  brands,
}: {
  models: CarModelAdmin[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const [brandFilter, setBrandFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = models.filter(
    (m) =>
      (brandFilter === "all" || m.brandId === brandFilter) &&
      m.name.toLowerCase().includes(q),
  );

  function handleDone() {
    setPanel(null);
    setError(null);
    router.refresh();
  }

  async function handleDelete(model: CarModelAdmin) {
    if (!confirm(`Eliminare il modello "${model.brand.name} ${model.name}"?`))
      return;

    setDeletingId(model.id);
    setError(null);
    const res = await fetch(`/api/admin/models/${model.id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!res.ok) {
      setError(await readApiError(res));
      return;
    }
    if (panel?.mode === "edit" && panel.model.id === model.id) setPanel(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Catalogo / Modelli</p>
          <h1 className="font-display text-3xl font-bold">Modelli</h1>
        </div>
        <button
          type="button"
          onClick={() => setPanel({ mode: "create" })}
          disabled={brands.length === 0}
          className="bg-aura-shimmer animate-shimmer rounded-xl px-5 py-3 font-extrabold text-white disabled:opacity-50 motion-reduce:animate-none"
        >
          + Nuovo modello
        </button>
      </div>

      {brands.length === 0 && (
        <p className="text-muted">
          Prima aggiungi almeno una marca nella sezione Marche.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <section className="min-w-0 flex-1 basis-[32rem] overflow-hidden rounded-3xl border border-border bg-card">
          <div className="flex flex-wrap gap-4 border-b border-border p-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted">
              Marca
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="rounded-xl border border-border bg-transparent px-4 py-2.5 text-base text-fg"
              >
                <option value="all">Tutte</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted">
              Cerca modello
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="es. Giulia"
                className="rounded-xl border border-border bg-transparent px-4 py-2.5 text-base text-fg outline-none focus:border-fg/40"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left">
              <thead className="text-sm text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Marca</th>
                  <th className="px-4 py-3 font-semibold">Modello</th>
                  <th className="px-4 py-3 font-semibold">Carrozzeria</th>
                  <th className="px-4 py-3 font-semibold">Novità</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Versioni
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-4 py-3 text-muted">{m.brand.name}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold">{m.name}</span>
                      <span className="block font-mono text-xs text-muted">
                        {m.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.bodyType ? BODY_TYPE_LABELS[m.bodyType] : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {m.launchedAt ? (
                        <span className="flex flex-col items-start gap-1">
                          {m.badge && (
                            <span className="bg-aura-shimmer rounded-full px-2.5 py-1 text-xs font-bold text-white">
                              {BADGE_LABELS[m.badge]}
                            </span>
                          )}
                          <span className="text-sm text-muted">
                            {formatMonthYear(m.launchedAt)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {m._count.versions}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setPanel({ mode: "edit", model: m })}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        disabled={deletingId === m.id}
                        className="ml-2 rounded-lg border border-border px-3 py-1.5 text-sm text-red-500 disabled:opacity-50"
                      >
                        {deletingId === m.id ? "…" : "Elimina"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted"
                    >
                      {models.length === 0
                        ? "Nessun modello. Aggiungi il primo!"
                        : "Nessun risultato."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="border-t border-border px-4 py-3 text-sm text-muted">
            {filtered.length} di {models.length} modelli
          </p>
        </section>

        {panel && (
          <ModelForm
            key={panel.mode === "edit" ? panel.model.id : "new"}
            model={panel.mode === "edit" ? panel.model : undefined}
            brands={brands}
            onDone={handleDone}
            onCancel={() => setPanel(null)}
          />
        )}
      </div>
    </div>
  );
}
