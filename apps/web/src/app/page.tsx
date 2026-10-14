import Link from "next/link";
import { SiteHeader } from "@/components/header/site-header";
import { serverFetch } from "@/lib/server-api";
import type { Brand } from "@riflessi/shared";

export default async function Home() {
  const brands = (await serverFetch<Brand[]>("/api/brands")) ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-56 size-[620px] animate-drift rounded-full motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(circle, rgb(124 92 255 / var(--glow-a)) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 size-[680px] animate-drift rounded-full [animation-direction:reverse] motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(circle, rgb(34 211 238 / var(--glow-b)) 0%, transparent 65%)",
        }}
      />

      <SiteHeader />

      <main className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pb-24 pt-16 text-center">
        <span className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold tracking-widest">
          <span className="size-2 rounded-full bg-cyan-400" />
          CATALOGO IN COSTRUZIONE
        </span>

        <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-none tracking-tight sm:text-7xl">
          Scopri le <span className="text-aura">novità</span>.
          <br />
          Confrontale in un attimo.
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Listini, versioni e schede tecniche di ogni auto nuova in Italia.
        </p>

        <section className="mt-10 flex w-full flex-col items-center gap-5">
          <h2 className="font-display text-2xl font-bold">
            Marche nel catalogo
          </h2>
          {brands.length === 0 ? (
            <p className="text-muted">Nessuna marca ancora.</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-2.5">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/catalogo/${b.slug}`}
                  className="rounded-full border border-border bg-card px-5 py-3 font-bold transition hover:border-fg/30"
                >
                  {b.name}
                  <span className="ml-2 text-sm font-medium text-muted">
                    {b._count.models}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
