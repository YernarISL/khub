import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/models.js";

class LoginController {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body as {
        username?: string;
        password?: string;
      };

      if (!username || !password) {
        return res
          .status(401)
          .json({ message: "Username or password not present" });
      }

      const user = await User.findOne({
        where: { username },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        if (!req.session) {
          return res.status(500).json({ message: "Session is not configured" });
        }

        req.session.userId = user.id;
        console.log(req.session.userId);

        console.log("Password is correct");
        return res.status(200).json({ message: "Login successful" });
      }

      return res.status(401).json({ message: "Invalid username or password" });
    } catch (error) {
      console.error("Login error: ", error);
      return res.status(401).json({ message: "Internal server error" });
    }
  }

  async getUserAuthInfo(req: Request, res: Response) {
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      secondName: user.secondName,
      role: user.role,
      profileImage: user.profileImage,
    });
  }
}

export default new LoginController();