const pino = require("pino");

const isDev = process.env.NODE_ENV === "dev";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined, // In prod: structured JSON
});

module.exports = logger;
