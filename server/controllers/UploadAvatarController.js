import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `user-${req.session.userId}${path.extname(file.originalname)}`
    );
  },
});

export const uploadAvatar = multer({ storage });
