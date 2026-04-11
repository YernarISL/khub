const { User } = require('../models/models');

const authMiddleware = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(req.session.userId, {
      attributes: ["id", "email", "username", "role"],
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
}

module.exports = authMiddleware;