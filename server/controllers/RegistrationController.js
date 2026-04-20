import { User } from "../models/models.js";
import bcrypt from "bcrypt";

class RegistrationController {
  async register(req, res) {
    try {
      const { email, password, username, firstName, secondName } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ message: "Email, password and username are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: email } });
      if (existingUser) {
        return res.json({ message: "User with this email already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await User.create({
        firstName,
        secondName,
        username,
        email,
        password: hashedPassword,
      });

      const { userPassword, ...safeUser } = newUser.dataValues

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
