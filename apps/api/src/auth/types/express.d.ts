import type { PublicUser } from '../auth/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
