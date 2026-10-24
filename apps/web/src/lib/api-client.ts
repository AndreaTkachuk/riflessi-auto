import { readApiError } from "./api-error";

const NETWORK_ERROR =
  "Impossibile contattare il server. Riprova tra qualche secondo.";

// Browser-side mutation request to our API (same origin, via the Next.js rewrite).
// Never throws: returns null on success, otherwise an error message to show the user —
// the API's message, or a network error when the API is down or restarting.
export async function apiRequest(
  path: string,
  { method, body }: { method: "POST" | "PATCH" | "DELETE"; body?: unknown },
): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
  } catch {
    return NETWORK_ERROR;
  }
  return res.ok ? null : readApiError(res);
}
