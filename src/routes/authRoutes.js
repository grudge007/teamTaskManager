const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");

router.post("/signup", authController.userSignup);
router.post("/login", authController.userLogin);
router.post("/refresh", authMiddleware, authController.refreshToken);
router.post("/logout", authMiddleware, authController.logoutUser);
router.delete("/delete", authMiddleware, authorizedRoles("admin", "user"), authController.deleteUser);

module.exports = router;
