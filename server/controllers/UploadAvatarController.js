const multer = require("multer");
const path = require("path");

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

module.exports = {
  uploadAvatar: multer({ storage }),
};
