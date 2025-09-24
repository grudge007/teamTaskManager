const authService = require("../services/authServices");
const { signupSchema, loginSchema } = require("../utils/validator");
const logger = require("../utils/logger");

// signup
exports.userSignup = async (req, res, next) => {
  const { value, error } = signupSchema.validate(req.body);
  if (error) {
    logger.error("Validation error: %s", error.details[0].message);
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  try {
    const newUser = await authService.userSignup(
      value.username,
      value.password,
      value.full_name,
      value.birthdate,
      value.role,
      value.gender
    );
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

// login
exports.userLogin = async (req, res, next) => {
  const { value, error } = loginSchema.validate(req.body);
  if (error) {
    logger.error("Validation error: %s", error.details[0].message);
    return res.status(400).json(error.details[0].message);
  }
  try {
    const loginAttempt = await authService.userLogin(
      value.username,
      value.password
    );
    res.status(202).json(loginAttempt);
  } catch (err) {
    next(err);
  }
};

// refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    // or const token = req.body.token, both are same
    const newToken = await authService.refreshToken(token);
    res.json(newToken);
  } catch (err) {
    next(err);
  }
};

// logout
exports.logoutUser = async (req, res, next) => {
  try {
    const { token } = req.body;
    await authService.logout(token);
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

// delete account
exports.deleteUser = async (req, res, next) => {
  try {
    const delUser = await authService.deleteUser(req.user.username);
    res.json(delUser);
  } catch (err) {
    next(err);
  }
};
