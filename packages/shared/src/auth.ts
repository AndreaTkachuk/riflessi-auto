import type { Role } from './enums.js';

// GET /api/auth/me, and req.user in the API (never includes passwordHash)
export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}
