const { User } = require("../models/models");
const bcrypt = require("bcrypt");

class RegistrationController {
  async register(req, res) {
    try {
      const user_id = req.user_id;
      const { email, password, username, firstName, secondName } = req.body;

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
        user_id: user_id,
        firstName,
        secondName,
        username,
        email,
        password: hashedPassword,
      });

      return res.json({
        message: "User successfully registered",
        data: newUser,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.json({ message: "Internal server error" });
    }
  }
}

module.exports = new RegistrationController();
