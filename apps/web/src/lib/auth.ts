import type { CurrentUser } from "@riflessi/shared";
import { cache } from "react";
import { serverFetch } from "./server-api";

// cache(): layout and page in the same request share one /auth/me call.
export const getCurrentUser = cache(() =>
  serverFetch<CurrentUser>("/api/auth/me", { auth: true }),
);
