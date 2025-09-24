const express = require("express");
const db = require("./config/db");

const app = express();
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoute = require("./routes/authRoutes.js");
const orgRoute = require("./routes/orgRoutes.js");
const logger = require("./utils/logger.js");

app.use(express.json());
app.use("/auth", authRoute);
app.use("/org", orgRoute);

app.use(errorMiddleware);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`app serving on port ${port}`);
});
