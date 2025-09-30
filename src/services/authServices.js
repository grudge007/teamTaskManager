const db = require("../config/db");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const redis = require("redis");
const redisClient = require("../utils/redis");
const secretKey = process.env.JWT_SECRET;
const refreshSecretKey = process.env.REFRESH_SECRET;

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

// loging
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
    const accessToken = jwt.sign(
      { uuid: user.uuid, username: user.username, role: user.role },
      secretKey,
      { expiresIn: "15d" }
    );
    const refreshToken = jwt.sign(
      { uuid: user.uuid, username: user.username, role: user.role },
      refreshSecretKey,
      { expiresIn: "7d" }
    );
    logger.info({ username }, "User logged in successfully");
    await redisClient.setEx(refreshToken, 7 * 24 * 60 * 60, user.uuid);
    // Return user info without password
    const { password: pwd, ...userData } = user;
    return {
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userData,
    };
  } catch (err) {
    logger.error({ username, stack: err.stack }, "Error during login");
    throw err;
  }
};

// refresh token
exports.refreshToken = async (token) => {
  if (!token) throw new Error("No token provided");

  // check if token exists in Redis
  const exists = await redisClient.get(token);
  if (!exists) throw new Error("Invalid refresh token");

  return new Promise((resolve, reject) => {
    jwt.verify(token, refreshSecretKey, (err, user) => {
      if (err) return reject(new Error("Forbidden"));

      const accessToken = jwt.sign(
        { uuid: user.uuid, username: user.username, role: user.role },
        secretKey,
        { expiresIn: "1d" }
      );

      resolve({ accessToken });
    });
  });
};

// logout
exports.logout = async (token) => {
  await redisClient.del(token);
};

// delete user
exports.deleteUser = async (username) => {
  try {
    const [results] = await db.query("DELETE FROM users WHERE username = ?", [
      username,
    ]);

    // DELETE returns affectedRows, not rows
    if (results.affectedRows === 0) {
      logger.info("Invalid username", { username });
      return { success: false, message: "Invalid User" };
    }

    logger.info("User deleted successfully", { username });
    return { success: true, message: "User deleted successfully" };
  } catch (err) {
    logger.error({ username, stack: err.stack }, "Error deleting user");
    throw err;
  }
};
