import type { Request, Response } from "express";
import { RoleChangeRequest } from "../models/models.js";
import { ROLES } from "../constants/roles.js";

const REQUEST_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

class RoleRequestController {
  async createRoleRequest(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { requestedRole, fullName, externalId } = req.body as {
        requestedRole?: string;
        fullName?: string;
        externalId?: string;
      };

      if (!requestedRole || !fullName || !externalId) {
        return res.status(422).json({ message: "requestedRole, fullName and externalId are required" });
      }

      if (![ROLES.STUDENT, ROLES.TEACHER].includes(requestedRole as typeof ROLES.STUDENT)) {
        return res.status(422).json({ message: "requestedRole must be STUDENT or TEACHER" });
      }

      const pendingRequest = await RoleChangeRequest.findOne({
        where: {
          userId: req.user.id,
          status: REQUEST_STATUSES.PENDING,
        },
      });

      if (pendingRequest) {
        return res.status(409).json({ message: "You already have a pending request" });
      }

      const request = await RoleChangeRequest.create({
        userId: req.user.id,
        requestedRole,
        fullName: fullName.trim(),
        externalId: externalId.trim(),
        status: REQUEST_STATUSES.PENDING,
      });

      return res.status(201).json({
        message: "Role request created",
        data: request,
      });
    } catch (error) {
      console.error("CREATE ROLE REQUEST ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getMyRoleRequest(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const request = await RoleChangeRequest.findOne({
        where: { userId: req.user.id },
        order: [["created_at", "DESC"]],
      });

      return res.json(request ?? null);
    } catch (error) {
      console.error("GET MY ROLE REQUEST ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async cancelMyRoleRequest(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      if (!id || Number.isNaN(Number(id))) {
        return res.status(422).json({ message: "Invalid request id" });
      }

      const request = await RoleChangeRequest.findByPk(Number(id));
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (Number(request.get("userId")) !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (request.get("status") !== REQUEST_STATUSES.PENDING) {
        return res.status(409).json({ message: "Only pending request can be cancelled" });
      }

      request.set("status", REQUEST_STATUSES.CANCELLED);
      await request.save();

      return res.json({ message: "Request cancelled", data: request });
    } catch (error) {
      console.error("CANCEL ROLE REQUEST ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export default new RoleRequestController();
