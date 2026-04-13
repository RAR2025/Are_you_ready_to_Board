import type { Role } from '@onboard/shared-types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role: Role;
        organizationId: number;
        userId: number;
      };
    }
  }
}