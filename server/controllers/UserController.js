import { User } from "../models/models.js";

class UserController {
  async getUserAuthInfo(req, res) {
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
  }
}
export default new UserController();