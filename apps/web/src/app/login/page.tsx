import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login/login-form";
import { getCurrentUser } from "@/lib/auth";

function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);

  if (await getCurrentUser()) redirect(next);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Link
          href="/"
          className="font-display text-2xl font-extrabold tracking-tight"
        >
          riflessi<span className="text-aura">.auto</span>
        </Link>
        <div className="flex w-full flex-col gap-6 rounded-3xl border border-border bg-card p-8">
          <h1 className="font-display text-2xl font-bold">Accedi</h1>
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
