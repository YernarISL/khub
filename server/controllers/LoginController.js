const bcrypt = require("bcrypt");
const { User } = require("../models/models");

class LoginController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.json({ message: "Username or password not present" });
      }

      const user = await User.findOne({
        where: { username: username },
      });

      if (!user) {
        return res.json({ message: "Invalid credentials" });
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res.json({ message: err });
        }

        if (result) {
          console.log("Password is correct");
          return res.json({ message: "Login successful" });
        } else {
          console.log("Password is incorrect!");
          return res.json({ message: "Password is incorrect" });
        }
      });
    } catch (error) {
      console.error("Login error: ", error);
      return res.json({ message: "Internal server error" });
    }
  }
}

module.exports = new LoginController();
