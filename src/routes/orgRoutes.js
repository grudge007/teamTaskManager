const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
// const roleMiddleware = require("../middlewares/roleMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");

module.exports = router;
