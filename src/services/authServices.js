const db = require("../config/db");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

// signup
exports.userSignup = async (
  username,
  password,
  full_name,
  birthdate,
  role,
  gender
) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [results] = await db.execute(
      "INSERT INTO users (username, password, full_name, birthdate, gender, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, full_name, birthdate, gender, role]
    );
    logger.info({ user: username }, "User Created Succesfully");
    return { Message: "User Created Successfully" };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const error = new Error("username exist");
      error.status = 400;
      logger.error({ error });
      throw error;
    }
    throw err;
  }
};

// login
exports.userLogin = async (username, password) => {
  try {
    const [results] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (results.length === 0) {
      logger.info("Invalide username", { username });
      return { Message: "Invalid Credentials" };
    }
    const user = results[0];
    const userPass = results[0].password;
    const isMatch = await bcrypt.compare(password, userPass);
    if (!isMatch) {
      logger.info("Invalid Password for", { username });
      return { Message: "Invalid Credentials" };
    }
    const token = jwt.sign(
      { uuid: user.uuid, username: user.username, role: user.role },
      secretKey,
      { expiresIn: "15" }
    );
    logger.info({ username }, "User logged in successfully");

    // Return user info without password
    const { password: pwd, ...userData } = user;

    return {
      success: true,
      message: "Login successful",
      token,
      user: userData,
    };
  } catch (err) {
    logger.error({ username, stack: err.stack }, "Error during login");
    throw err;
  }
};
