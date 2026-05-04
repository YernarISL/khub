import type { Request, Response } from "express";
import { User, Material } from "../models/models.js";
import { ROLES, type Role } from "../constants/roles.js";

class AdminController {
  async getUsers(req: Request, res: Response) {
    const { limit = 20, offset = 0 } = req.query as {
      limit?: string | number;
      offset?: string | number;
    };

    const users = await User.findAll({
      limit: Number(limit),
      offset: Number(offset),
      attributes: ["id", "username", "email", "role"],
      order: [["id", "DESC"]],
    });
    res.json(users);
  }

  async getMaterials(req: Request, res: Response) {
    const { limit = 20, offset = 0 } = req.query as {
      limit?: string | number;
      offset?: string | number;
    };

    const materials = await Material.findAll({
      include: {
        model: User,
        attributes: ["firstName", "secondName"],
      },
      limit: Number(limit),
      offset: Number(offset),
      attributes: ["id", "title", "materialCategory", "userId", "createdAt", "updatedAt"],
      order: [["id", "DESC"]],
    });
    res.json(materials);
  }

  async deleteMaterial(req: Request, res: Response) {
    try {
      console.log("DELETE MATERIAL ID:", req.params.id);
      const { id } = req.params;
      
      if (typeof id !== "string") {
        return res.status(400).json({ message: "Invalid material ID" });
      }

      const material = await Material.findByPk(id);
      console.log("FOUND MATERIAL:", material);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }

      await material.destroy();

      return res.json({ message: "Material deleted successfully" });
    } catch (error) {
      console.error("DELETE MATERIAL ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const requester = req.user;
      const { id } = req.params;
      const { role } = req.body as { role?: string };

      if (!requester) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!id || Number.isNaN(Number(id))) {
        return res.status(422).json({ message: "Invalid user id" });
      }

      if (!role) {
        return res.status(422).json({ message: "Role is required" });
      }

      const assignableRolesByRole: Partial<Record<Role, Role[]>> = {
        [ROLES.ADMIN]: [ROLES.MANAGER],
        [ROLES.MANAGER]: [ROLES.STUDENT, ROLES.TEACHER],
      };

      const allowedRoles = assignableRolesByRole[requester.role] ?? [];
      if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
        return res.status(403).json({ message: "You cannot assign this role" });
      }

      const targetUser = await User.findByPk(Number(id), {
        attributes: ["id", "username", "email", "role"],
      });

      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const targetUserId = Number(targetUser.get("id"));
      if (targetUserId === requester.id) {
        return res.status(403).json({ message: "Cannot change your own role" });
      }

      targetUser.set("role", role);
      await targetUser.save();

      return res.json({
        message: "User role updated successfully",
        data: targetUser,
      });
    } catch (error) {
      console.error("UPDATE USER ROLE ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export default new AdminController();