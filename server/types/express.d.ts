import type { IncomingMessage } from "node:http";

declare global {
  namespace Express {
    interface Request {
      user?: any;
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