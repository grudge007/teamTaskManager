const Joi = require("joi");
// signup
const signupSchema = Joi.object({
  username: Joi.string().min(4).max(8).required(),
  password: Joi.string().min(5).max(15).required(),
  gender: Joi.string().valid("male", "female").required(),
  full_name: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required(),
  birthdate: Joi.date()
    .iso() // Use .iso() for YYYY-MM-DD format
    .max("2015-01-01")
    .min("1900-01-01")
    .required()
    .messages({
      "date.format": "Birthdate must be in YYYY-MM-DD format",
      "date.max": "You must be at least 8 years old",
      "date.min": "Date must be after 1900-01-01",
      "any.required": "Birthdate is required",
    }),
  role: Joi.string().valid("user", "admin").default("user"), //"readonly" is can only assigned by admin to a user
}).unknown(false);

// login
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
}).unknown(false);

module.exports = {
  signupSchema,
  loginSchema,
};
