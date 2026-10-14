import { cache } from "react";
import { serverFetch } from "./server-api";

export type UserRole = "ADMIN" | "EDITOR" | "DEALER" | "USER";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

// cache(): layout and page in the same request share one /auth/me call.
export const getCurrentUser = cache(() =>
  serverFetch<CurrentUser>("/api/auth/me", { auth: true }),
);
