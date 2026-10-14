export async function readApiError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = data?.message;
  if (Array.isArray(message)) return message.join(" · ");
  return message ?? `Errore ${res.status}`;
}
