const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://127.0.0.1:6379", // default local Redis
});

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect(); // connect on startup
})();

module.exports = redisClient;
