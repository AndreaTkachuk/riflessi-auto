"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  formatEur,
} from "@/lib/labels";
import type { CarModelAdmin, CarVersionAdmin } from "@riflessi/shared";
import { ErrorAlert } from "./form-ui";
import { VersionForm } from "./version-form";

type Panel =
  | { mode: "create" }
  | { mode: "edit"; version: CarVersionAdmin }
  | null;

const filterCls =
  "rounded-xl border border-border bg-transparent px-4 py-2.5 text-base text-fg";

export function VersionsManager({
  versions,
  models,
  initialModelId,
}: {
  versions: CarVersionAdmin[];
  models: CarModelAdmin[];
  initialModelId?: string;
}) {
  const router = useRouter();
  const initialModel = models.find((m) => m.id === initialModelId);

  const [panel, setPanel] = useState<Panel>(null);
  const [brandFilter, setBrandFilter] = useState(
    initialModel?.brandId ?? "all",
  );
  const [modelFilter, setModelFilter] = useState(initialModel?.id ?? "all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Only brands that have at least one model; models are already sorted by brand name.
  const brands = [
    ...new Map(models.map((m) => [m.brand.id, m.brand])).values(),
  ];
  const brandModels = models.filter(
    (m) => brandFilter === "all" || m.brandId === brandFilter,
  );

  const q = query.trim().toLowerCase();
  const filtered = versions.filter(
    (v) =>
      (brandFilter === "all" || v.model.brand.id === brandFilter) &&
      (modelFilter === "all" || v.modelId === modelFilter) &&
      v.name.toLowerCase().includes(q),
  );

  function handleDone() {
    setPanel(null);
    setError(null);
    router.refresh();
  }

  async function handleDelete(version: CarVersionAdmin) {
    const label = `${version.model.brand.name} ${version.model.name} ${version.name}`;
    if (!confirm(`Eliminare la versione "${label}"?`)) return;

    setDeletingId(version.id);
    setError(null);
    const error = await apiRequest(`/api/admin/versions/${version.id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (error) {
      setError(error);
      return;
    }
    if (panel?.mode === "edit" && panel.version.id === version.id)
      setPanel(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Catalogo / Versioni</p>
          <h1 className="font-display text-3xl font-bold">Versioni</h1>
        </div>
        <button
          type="button"
          onClick={() => setPanel({ mode: "create" })}
          disabled={models.length === 0}
          className="bg-aura-shimmer animate-shimmer rounded-xl px-5 py-3 font-extrabold text-white disabled:opacity-50 motion-reduce:animate-none"
        >
          + Nuova versione
        </button>
      </div>

      {models.length === 0 && (
        <p className="text-muted">
          Prima aggiungi almeno un modello nella sezione Modelli.
        </p>
      )}

      <ErrorAlert message={error} />

      <div className="flex flex-wrap items-start gap-6">
        <section className="min-w-0 flex-1 basis-[32rem] overflow-hidden rounded-3xl border border-border bg-card">
          <div className="flex flex-wrap gap-4 border-b border-border p-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted">
              Marca
              <select
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setModelFilter("all");
                }}
                className={filterCls}
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
              Modello
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className={filterCls}
              >
                <option value="all">Tutti</option>
                {brandModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {brandFilter === "all" ? `${m.brand.name} ${m.name}` : m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted">
              Cerca versione
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="es. Hybrid"
                className={`${filterCls} outline-none focus:border-fg/40`}
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left">
              <thead className="text-sm text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Modello</th>
                  <th className="px-4 py-3 font-semibold">Versione</th>
                  <th className="px-4 py-3 font-semibold">Anni</th>
                  <th className="px-4 py-3 font-semibold">Motore</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Potenza
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Prezzo
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="px-4 py-3 text-muted">
                      {v.model.brand.name} {v.model.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold">{v.name}</span>
                      <span className="block font-mono text-xs text-muted">
                        {v.slug}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {v.yearFrom}–{v.yearTo ?? ""}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {FUEL_TYPE_LABELS[v.fuelType]}
                      <span className="block text-muted">
                        {TRANSMISSION_LABELS[v.transmission]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                      {v.powerHp ? `${v.powerHp} CV` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                      {v.priceNewEur ? formatEur(v.priceNewEur) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setPanel({ mode: "edit", version: v })}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        disabled={deletingId === v.id}
                        className="ml-2 rounded-lg border border-border px-3 py-1.5 text-sm text-red-500 disabled:opacity-50"
                      >
                        {deletingId === v.id ? "…" : "Elimina"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted"
                    >
                      {versions.length === 0
                        ? "Nessuna versione. Aggiungi la prima!"
                        : "Nessun risultato."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="border-t border-border px-4 py-3 text-sm text-muted">
            {filtered.length} di {versions.length} versioni
          </p>
        </section>

        {panel && (
          <VersionForm
            key={panel.mode === "edit" ? panel.version.id : "new"}
            version={panel.mode === "edit" ? panel.version : undefined}
            models={models}
            defaultModelId={modelFilter === "all" ? undefined : modelFilter}
            onDone={handleDone}
            onCancel={() => setPanel(null)}
          />
        )}
      </div>
    </div>
  );
}
