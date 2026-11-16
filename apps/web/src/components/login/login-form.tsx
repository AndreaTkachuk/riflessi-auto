"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { apiRequest } from "@/lib/api-client";

interface State {
  error: string | null;
  email: string;
}

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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

      <div className="flex flex-col gap-2">
        <label
          htmlFor="login-password"
          className="text-sm font-semibold text-muted"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-border bg-card py-3 pl-4 pr-12 text-base text-fg outline-none focus:border-fg/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            aria-pressed={showPassword}
            aria-controls="login-password"
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-muted hover:text-fg"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

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

function EyeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.4 3.3" />
      <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
