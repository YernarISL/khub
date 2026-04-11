const checkAdmin = (req, res, next) => {
  if (req.user.role != "ADMIN") {
    return res.status(403).json({ message: "Forbidden"});
  }
  next();
}

module.exports = checkAdmin;