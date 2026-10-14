"use client";

import { useActionState, useState } from "react";
import { readApiError } from "@/lib/api-error";
import { BADGE_LABELS, BODY_TYPE_LABELS } from "@/lib/labels";
import { type Brand, type CarModelAdmin, slugify } from "@riflessi/shared";

const inputCls =
  "rounded-xl border border-border bg-card px-4 py-3 text-base text-fg outline-none focus:border-fg/40";
const labelCls = "flex flex-col gap-2 text-sm font-semibold text-muted";

interface Props {
  model?: CarModelAdmin;
  brands: Brand[];
  onDone: () => void;
  onCancel: () => void;
}

export function ModelForm({ model, brands, onDone, onCancel }: Props) {
  const isEdit = Boolean(model);

  const [name, setName] = useState(model?.name ?? "");
  const [slug, setSlug] = useState(model?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const shownSlug = slugTouched ? slug : slugify(name);

  const [error, formAction, pending] = useActionState(
    async (
      _prev: string | null,
      formData: FormData,
    ): Promise<string | null> => {
      const field = (key: string) => {
        const value = String(formData.get(key) ?? "").trim();
        return value === "" ? null : value;
      };

      const body = {
        brandId: field("brandId"),
        name: name.trim(),
        ...(shownSlug ? { slug: shownSlug } : {}),
        bodyType: field("bodyType"),
        launchedAt: field("launchedAt"),
        badge: field("badge"),
        description: field("description"),
      };

      const res = await fetch(
        model ? `/api/admin/models/${model.id}` : "/api/admin/models",
        {
          method: model ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) return readApiError(res);
      onDone();
      return null;
    },
    null,
  );

  return (
    <form
      action={formAction}
      className="flex w-full flex-col gap-4 rounded-3xl border border-border bg-card p-6 lg:w-[26rem]"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">
          {isEdit ? "Modifica modello" : "Nuovo modello"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Chiudi"
          className="grid size-10 place-items-center rounded-xl border border-border"
        >
          ✕
        </button>
      </div>

      <label className={labelCls}>
        Marca *
        <select
          name="brandId"
          required
          defaultValue={model?.brandId ?? ""}
          className={inputCls}
        >
          <option value="" disabled>
            Scegli una marca
          </option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <label className={labelCls}>
        Nome del modello *
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="es. Giulia"
          className={inputCls}
        />
      </label>

      <label className={labelCls}>
        Slug
        <input
          value={shownSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={`${inputCls} font-mono text-sm`}
        />
      </label>

      <label className={labelCls}>
        Carrozzeria
        <select
          name="bodyType"
          defaultValue={model?.bodyType ?? ""}
          className={inputCls}
        >
          <option value="">—</option>
          {Object.entries(BODY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-3 rounded-2xl border border-border p-4">
        <legend className="px-2 text-sm font-bold">Novità in home</legend>
        <p className="text-sm text-muted">
          Compila la data di lancio per mostrare il modello tra le novità.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={labelCls}>
            Data di lancio
            <input
              name="launchedAt"
              type="date"
              defaultValue={model?.launchedAt?.slice(0, 10) ?? ""}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Etichetta
            <select
              name="badge"
              defaultValue={model?.badge ?? ""}
              className={inputCls}
            >
              <option value="">—</option>
              {Object.entries(BADGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <label className={labelCls}>
        Descrizione
        <textarea
          name="description"
          rows={4}
          defaultValue={model?.description ?? ""}
          placeholder="Breve presentazione del modello"
          className={inputCls}
        />
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-3 font-semibold"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-fg px-5 py-3 font-bold text-bg disabled:opacity-60"
        >
          {pending ? "Salvataggio…" : "Salva modello"}
        </button>
      </div>
    </form>
  );
}
