"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setPending(true);
    const result = await apiRequest("/api/auth/logout", { method: "POST" });
    setPending(false);
    setError(result);
    if (result) return;
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      title={error ?? undefined}
      className={`rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:text-fg disabled:opacity-60 ${error ? "text-red-500" : "text-muted"}`}
    >
      {error ? "Riprova" : "Esci"}
    </button>
  );
}
