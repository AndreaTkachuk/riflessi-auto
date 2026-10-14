import { cookies } from "next/headers";

interface ServerFetchOptions {
  // Endpoint requires login: forward the user's cookie,
  // and skip the request entirely when there is no cookie.
  auth?: boolean;
}

export async function serverFetch<T>(
  path: string,
  { auth = false }: ServerFetchOptions = {},
): Promise<T | null> {
  const headers: HeadersInit = {};

  if (auth) {
    const token = (await cookies()).get("access_token")?.value;
    if (!token) return null;
    headers.Cookie = `access_token=${token}`;
  }

  try {
    const res = await fetch(`${process.env.API_URL}${path}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
