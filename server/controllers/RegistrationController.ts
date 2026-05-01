import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/models.js";

class RegistrationController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, username, firstName, secondName } = req.body as {
        email?: string;
        password?: string;
        username?: string;
        firstName?: string;
        secondName?: string;
      };

      if (!email || !password || !username) {
        return res.status(400).json({ message: "Email, password and username are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.json({ message: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        firstName,
        secondName,
        username,
        email,
        password: hashedPassword,
      });

      const { password: userPassword, ...safeUser } = newUser.dataValues;
      void userPassword;

      return res.status(201).json({
        message: "User successfully registered",
        data: safeUser,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new RegistrationController();