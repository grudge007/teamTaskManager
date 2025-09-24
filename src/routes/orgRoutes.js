const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");
const orgController = require("../controllers/orgController");

router.post("/create", authMiddleware, orgController.createOrg);
router.get("/", authMiddleware, orgController.listOrg);
router.get(
  "/:id",
  authMiddleware,
  authorizedRoles("owner", "member", "admin", "readonly"),
  orgController.listOrgDetails
);
module.exports = router;
