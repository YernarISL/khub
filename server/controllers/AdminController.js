import { User, Material } from "../models/models.js";

class AdminController {
    async getUsers(req, res) {
        const { limit = 20, offset = 0 } = req.query;

        const users = await User.findAll({
            limit: Number(limit),
            offset: Number(offset),
            attributes: ["id", "username", "email", "role"],
            order: [["id", "DESC"]],
        });
        res.json(users);
    }

    async getMaterials(req, res) {
        const { limit = 20, offset = 0 } = req.query;

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

    async deleteMaterial(req, res) {
        try {
            console.log("DELETE MATERIAL ID:", req.params.id);
            const { id } = req.params;
            const material = await Material.findByPk(id);
            console.log("FOUND MATERIAL:", material);
            if (!material) {
                return res.status(404).json({ message: "Material not found" });
            }

            await material.destroy();

            return res.json({ message: "Material deleted successfully" });
        } catch (e) {
            console.error("DELETE MATERIAL ERROR:", e);
            return res.status(500).json({ message: "Server error" });
        }
    }
}

export default new AdminController();