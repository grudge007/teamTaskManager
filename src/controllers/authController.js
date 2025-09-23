const authService = require("../services/authServices");
const { signupSchema, loginSchema } = require("../utils/validator");
const logger = require("../utils/logger");

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
