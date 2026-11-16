// Shared building blocks for admin forms and tables.

export const inputCls =
  "rounded-xl border border-border bg-card px-4 py-3 text-base text-fg outline-none focus:border-fg/40";
export const labelCls = "flex flex-col gap-2 text-sm font-semibold text-muted";

export function ErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
    >
      {message}
    </p>
  );
}
