const logger = require("../utils/logger");
const db = require("../config/db");

// Usage: authorizedRoles('owner', 'admin')
function authorizedRoles(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const orgId = req.params.id; // assume orgId comes from route params
      const [rows] = await db.execute(
        "SELECT role FROM organization_members WHERE user_id = ? AND org_id = ?",
        [req.user.uuid, orgId]
      );
      if (rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const userRole = rows[0].role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn({ userId: req.user.uuid, role: userRole }, "Access denied");
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      next();
    } catch (error) {
      logger.error(error, "Error checking authorization");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
}

module.exports = authorizedRoles;
