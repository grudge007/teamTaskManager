const logger = require("../utils/logger");

function authorizedRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!allowedRoles.includes(user.role)) {
      logger.warn(
        { username: user.username, role: user.role },
        "Access denied"
      );
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

module.exports = authorizedRoles;
