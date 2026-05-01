import express from "express";
import { uploadAvatar } from "../controllers/UploadAvatarController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { User } from "../models/models.js";

const router = express.Router();

router.post(
  "/avatar",
  authMiddleware,
  (req, res, next) => {
    console.log("✅ дошли до multer");
    next();
  },
  uploadAvatar.single("avatar"),
  async (req, res) => {
    console.log("✅ файл загружен");

    try {
      if (!req.file) {
        return res.status(400).json({ message: "File not provided" });
      }

      console.log("req.file:", req.file);
      console.log("req.session:", req.session);

      const user = await User.findByPk(req.session.userId);
      console.log("user:", user);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profileImage = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      res.json({ profileImage: user.profileImage });
    } catch (error) {
      console.error("🔥 ERROR:", error);
      res.status(500).json({ message: "Avatar upload error" });
    }
  }
);

export default router;