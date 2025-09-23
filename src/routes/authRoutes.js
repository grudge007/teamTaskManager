const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/user/signup", authController.userSignup);
router.post("/user/login", authController.userLogin);

module.exports = router;
