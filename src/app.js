const express = require("express");
const db = require("./config/db");

const app = express();
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoute = require("./routes/authRoutes.js");
const teamRoute = require("./routes/teamRoutes.js");
const logger = require("./utils/logger.js");

app.use(express.json());
app.use("/auth", authRoute);
app.use("/teams", teamRoute);

app.use(errorMiddleware);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`app serving on port ${port}`);
});
