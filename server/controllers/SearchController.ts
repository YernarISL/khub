import type { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { User, Material } from "../models/models.js";

class SearchController {
  async getAllUsers(req: Request, res: Response) {
    const data = await User.findAll();
    return res.json({ message: "Works!", data });
  }

  async getAllMaterials(req: Request, res: Response) {
    const data = await Material.findAll();
    return res.json({ message: "Works!", data });
  }

  async search(req: Request, res: Response, next: NextFunction) {
    const query = typeof req.query.q === "string" ? req.query.q : undefined;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "Invalid query" });
    }

    const searchTerm = query.trim();
    const [users, materials] = await Promise.all([
      User.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${searchTerm}%` } },
            { secondName: { [Op.iLike]: `%${searchTerm}%` } },
            { username: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
        limit: 20,
      }),
      Material.findAll({ where: { title: { [Op.iLike]: `%${searchTerm}%` } }, limit: 20 }),
    ]);

    void next;
    return res.json({ users, materials });
  }
}

export default new SearchController();