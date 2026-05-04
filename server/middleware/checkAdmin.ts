import type { NextFunction, Request, Response } from "express";
import { ROLES } from "../constants/roles.js";
import requireRoles from "./requireRoles.js";

const checkAdmin = (req: Request, res: Response, next: NextFunction) =>
  requireRoles(ROLES.ADMIN)(req, res, next);

export default checkAdmin;