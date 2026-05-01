import type { NextFunction, Request, Response } from "express";

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

export default checkAdmin;