const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
// const roleMiddleware = require("../middlewares/roleMiddleware");
const teamController = require("../controllers/teamController");
const authorizedRoles = require("../middlewares/roleMiddleware");

router.post(
  "/create",
  authMiddleware,
  authorizedRoles("admin"),
  teamController.createTeam
);
module.exports = router;
