import { cookies } from "next/headers";

export type UserRole = "ADMIN" | "EDITOR" | "DEALER" | "USER";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.API_URL}/api/auth/me`, {
      headers: { Cookie: `access_token=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
