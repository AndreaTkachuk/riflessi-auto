"use client";

import { useActionState, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import {
  EMISSION_CLASS_LABELS,
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
} from "@/lib/labels";
import {
  type CarModelAdmin,
  type CarVersionAdmin,
  slugify,
} from "@riflessi/shared";
import { ErrorAlert, inputCls, labelCls } from "./form-ui";

interface Props {
  version?: CarVersionAdmin;
  models: CarModelAdmin[];
  // Preselected model for a new version (the current filter in the table).
  defaultModelId?: string;
  onDone: () => void;
  onCancel: () => void;
}

// Number inputs with the same limits as the API DTO (min/max give instant browser feedback).
const NUMBER_FIELDS: {
  name: keyof CarVersionAdmin;
  label: string;
  min: number;
  max: number;
  step?: number;
  placeholder?: string;
}[] = [
  { name: "engineCc", label: "Cilindrata (cm³)", min: 50, max: 10000, placeholder: "es. 1199" },
  { name: "powerKw", label: "Potenza (kW)", min: 1, max: 2000, placeholder: "es. 74" },
  { name: "powerHp", label: "Potenza (CV)", min: 1, max: 3000, placeholder: "es. 100" },
  { name: "consumption", label: "Consumo (l o kWh/100 km)", min: 0, max: 999.9, step: 0.1, placeholder: "es. 5,4" },
  { name: "co2Gkm", label: "CO₂ (g/km)", min: 0, max: 1000, placeholder: "es. 120" },
  { name: "batteryKwh", label: "Batteria (kWh)", min: 1, max: 999.9, step: 0.1, placeholder: "elettriche e plug-in" },
  { name: "rangeKm", label: "Autonomia elettrica (km)", min: 1, max: 2000, placeholder: "WLTP" },
  { name: "doors", label: "Porte", min: 1, max: 7, placeholder: "es. 5" },
  { name: "seats", label: "Posti", min: 1, max: 9, placeholder: "es. 5" },
];

export function VersionForm({
  version,
  models,
  defaultModelId,
  onDone,
  onCancel,
}: Props) {
  const isEdit = Boolean(version);

  const [name, setName] = useState(version?.name ?? "");
  const [slug, setSlug] = useState(version?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const shownSlug = slugTouched ? slug : slugify(name);

  // Models are sorted by brand name: group them for <optgroup>.
  const modelsByBrand = Map.groupBy(models, (m) => m.brand.name);

  const [error, formAction, pending] = useActionState(
    async (
      _prev: string | null,
      formData: FormData,
    ): Promise<string | null> => {
      const field = (key: string) => {
        const value = String(formData.get(key) ?? "").trim();
        return value === "" ? null : value;
      };
      // <input type="number"> always submits "5.4" (dot), whatever the browser locale.
      const num = (key: string) => {
        const value = field(key);
        return value === null ? null : Number(value);
      };

      const body = {
        modelId: field("modelId"),
        name: name.trim(),
        ...(shownSlug ? { slug: shownSlug } : {}),
        yearFrom: num("yearFrom"),
        yearTo: num("yearTo"),
        fuelType: field("fuelType"),
        transmission: field("transmission"),
        emissionClass: field("emissionClass"),
        priceNewEur: num("priceNewEur"),
        ...Object.fromEntries(NUMBER_FIELDS.map((f) => [f.name, num(f.name)])),
      };

      const error = await apiRequest(
        version ? `/api/admin/versions/${version.id}` : "/api/admin/versions",
        { method: version ? "PATCH" : "POST", body },
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
      className="flex w-full flex-col gap-4 rounded-3xl border border-border bg-card p-6 lg:w-[30rem]"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">
          {isEdit ? "Modifica versione" : "Nuova versione"}
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
        Modello *
        <select
          name="modelId"
          required
          defaultValue={version?.modelId ?? defaultModelId ?? ""}
          className={inputCls}
        >
          <option value="" disabled>
            Scegli un modello
          </option>
          {[...modelsByBrand].map(([brandName, brandModels]) => (
            <optgroup key={brandName} label={brandName}>
              {brandModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className={labelCls}>
        Nome della versione *
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="es. 1.2 Hybrid 110 CV Icon"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelCls}>
          Anno inizio *
          <input
            name="yearFrom"
            type="number"
            required
            min={1950}
            max={2100}
            defaultValue={version?.yearFrom ?? new Date().getFullYear()}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Anno fine
          <input
            name="yearTo"
            type="number"
            min={1950}
            max={2100}
            defaultValue={version?.yearTo ?? ""}
            placeholder="in produzione"
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Alimentazione *
          <select
            name="fuelType"
            required
            defaultValue={version?.fuelType ?? ""}
            className={inputCls}
          >
            <option value="" disabled>
              Scegli
            </option>
            {Object.entries(FUEL_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Cambio *
          <select
            name="transmission"
            required
            defaultValue={version?.transmission ?? ""}
            className={inputCls}
          >
            <option value="" disabled>
              Scegli
            </option>
            {Object.entries(TRANSMISSION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-2xl border border-border p-4">
        <legend className="px-2 text-sm font-bold">Dati tecnici</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {NUMBER_FIELDS.map((f) => (
            <label key={f.name} className={labelCls}>
              {f.label}
              <input
                name={f.name}
                type="number"
                min={f.min}
                max={f.max}
                step={f.step ?? 1}
                defaultValue={version?.[f.name]?.toString() ?? ""}
                placeholder={f.placeholder}
                className={inputCls}
              />
            </label>
          ))}
          <label className={labelCls}>
            Classe Euro
            <select
              name="emissionClass"
              defaultValue={version?.emissionClass ?? ""}
              className={inputCls}
            >
              <option value="">—</option>
              {Object.entries(EMISSION_CLASS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <label className={labelCls}>
        Prezzo di listino (€)
        <input
          name="priceNewEur"
          type="number"
          min={1}
          max={10_000_000}
          defaultValue={version?.priceNewEur ?? ""}
          placeholder="es. 22150"
          className={inputCls}
        />
      </label>

      <ErrorAlert message={error} />

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
          {pending ? "Salvataggio…" : "Salva versione"}
        </button>
      </div>
    </form>
  );
}
