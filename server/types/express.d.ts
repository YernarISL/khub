import type { IncomingMessage } from "node:http";
import type { Role } from "../constants/roles.js";

interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      file?: any;
      session: {
        userId?: number;
        destroy(callback: (err: any) => void): void;
        [key: string]: any;
      };
    }
  }
}

export {};