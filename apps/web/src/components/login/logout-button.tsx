"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted hover:text-fg"
    >
      Esci
    </button>
  );
}
