import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/login/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth";

const MENU = [
  { href: "/admin/marche", label: "Marche", ready: true },
  { href: "/admin/modelli", label: "Modelli", ready: false },
  { href: "/admin/versioni", label: "Versioni", ready: false },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/");

  return (
    <div className="flex min-h-screen flex-wrap">
      <aside className="flex w-full flex-col gap-6 border-border p-5 md:w-64 md:border-r">
        <Link
          href="/"
          className="font-display text-lg font-extrabold tracking-tight"
        >
          riflessi<span className="text-aura">.auto</span>
          <span className="ml-2 align-middle text-xs font-medium text-muted">
            ADMIN
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          <span className="px-3 pb-1 text-xs font-bold tracking-widest text-muted">
            CATALOGO
          </span>
          {MENU.map((item) =>
            item.ready ? (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2.5 font-semibold hover:bg-card"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.href}
                className="flex justify-between rounded-xl px-3 py-2.5 text-muted"
              >
                {item.label}
                <span className="text-xs">presto</span>
              </span>
            ),
          )}
        </nav>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="mr-auto text-sm">
            {user.name ?? user.email}
            <span className="block text-xs text-muted">{user.role}</span>
          </span>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
