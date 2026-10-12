import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Novità" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/confronta", label: "Confronta" },
  { href: "/usato", label: "Usato" },
];

export function SiteHeader() {
  return (
    <header className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-4 px-6 py-4">
      <Link
        href="/"
        className="font-display text-xl font-extrabold tracking-tight"
      >
        riflessi<span className="text-aura">.auto</span>
      </Link>

      <nav className="flex flex-wrap gap-1 rounded-full border border-border bg-card p-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-muted transition hover:text-fg"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2.5">
        <ThemeToggle />
        <Link
          href="/login"
          className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold"
        >
          Accedi
        </Link>
        <Link
          href="/vendi"
          className="bg-aura-shimmer animate-shimmer rounded-full px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/30 motion-reduce:animate-none"
        >
          Vendi la tua auto
        </Link>
      </div>
    </header>
  );
}
