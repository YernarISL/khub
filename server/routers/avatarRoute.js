const Router = require("express");
const router = new Router();
const avatarController = require("../controllers/UploadAvatarController");
const authMiddleware = require("../middleware/authMiddleware");
const { User } = require("../models/models");
const uploadAvatar = avatarController.uploadAvatar;

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

      user.profileImage = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      res.json({ profileImage: user.profileImage });
    } catch (e) {
      console.error("🔥 ERROR:", e);
      res.status(500).json({ message: "Avatar upload error" });
    }
  }
);

module.exports = router;
