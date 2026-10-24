"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { apiRequest } from "@/lib/api-client";

interface State {
  error: string | null;
  email: string;
}

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      // 401 → "Credenziali non valide" from the API; network error → "Impossibile contattare…"
      const error = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (error) return { error, email };

      router.push(next);
      router.refresh();
      return { error: null, email };
    },
    { error: null, email: "" },
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold text-muted">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          className="rounded-xl border border-border bg-card px-4 py-3 text-base text-fg outline-none focus:border-fg/40"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-muted">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-xl border border-border bg-card px-4 py-3 text-base text-fg outline-none focus:border-fg/40"
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-aura-shimmer animate-shimmer mt-2 rounded-xl px-5 py-3.5 font-extrabold text-white disabled:opacity-60 motion-reduce:animate-none"
      >
        {pending ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}
