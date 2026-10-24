"use client";

import { useActionState, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { type Brand, slugify } from "@riflessi/shared";

const inputCls =
  "rounded-xl border border-border bg-card px-4 py-3 text-base text-fg outline-none focus:border-fg/40";
const labelCls = "flex flex-col gap-2 text-sm font-semibold text-muted";

interface Props {
  brand?: Brand;
  onDone: () => void;
  onCancel: () => void;
}

export function BrandForm({ brand, onDone, onCancel }: Props) {
  const isEdit = Boolean(brand);

  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const shownSlug = slugTouched ? slug : slugify(name);

  const [error, formAction, pending] = useActionState(
    async (
      _prev: string | null,
      formData: FormData,
    ): Promise<string | null> => {
      const country = String(formData.get("country") ?? "").trim();
      const logoUrl = String(formData.get("logoUrl") ?? "").trim();

      const body = {
        name: name.trim(),
        ...(shownSlug ? { slug: shownSlug } : {}),
        country: country || null,
        logoUrl: logoUrl || null,
      };

      const error = await apiRequest(
        brand ? `/api/admin/brands/${brand.id}` : "/api/admin/brands",
        { method: brand ? "PATCH" : "POST", body },
      );

      if (error) return error;
      onDone();
      return null;
    },
    null,
  );

  return (
    <form
      action={formAction}
      className="flex w-full flex-col gap-4 rounded-3xl border border-border bg-card p-6 lg:w-96"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">
          {isEdit ? "Modifica marca" : "Nuova marca"}
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
        Nome *
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          placeholder="es. Alfa Romeo"
          className={inputCls}
        />
      </label>

      <label className={labelCls}>
        Slug (indirizzo della pagina)
        <input
          value={shownSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={`${inputCls} font-mono text-sm`}
        />
        <span className="font-normal">
          riflessi.auto/catalogo/{shownSlug || "…"}
        </span>
        {isEdit && (
          <span className="font-normal text-amber-500">
            Cambiare lo slug cambia l&apos;indirizzo della pagina
          </span>
        )}
      </label>

      <label className={labelCls}>
        Paese
        <input
          name="country"
          defaultValue={brand?.country ?? ""}
          placeholder="es. Italia"
          className={inputCls}
        />
      </label>

      <label className={labelCls}>
        URL del logo
        <input
          name="logoUrl"
          type="url"
          defaultValue={brand?.logoUrl ?? ""}
          placeholder="https://…"
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
          {pending ? "Salvataggio…" : "Salva marca"}
        </button>
      </div>
    </form>
  );
}
