const { SCHEMA_TEXT_FIELD_PHONETIC } = require("redis");
const db = require("../config/db");
const logger = require("../utils/logger");
const { SELECT } = require("sequelize/lib/query-types");

// create org
exports.createOrg = async (org_name, user_uuid) => {
  try {
    const [results1] = await db.execute(
      "INSERT INTO organizations (name, created_by) VALUES (?, ?)",
      [org_name, user_uuid]
    );
    logger.info({ user: org_name }, "Organization Created Succesfully");
    console.log(results1);
    const [results2] = await db.execute(
      "INSERT INTO organization_members (org_id, user_id, role) VALUES (?, ?, ?)",
      [results1.insertId, user_uuid, "owner"]
    );
    return { message: "Organization Created Succefully", org_name: org_name };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const error = new Error("Organization exists");
      error.status = 400;
      logger.error({ error });
      throw error;
    }
    throw err;
  }
};

// list orgs
exports.listOrg = async (user_uuid) => {
  try {
    const [results] = await db.query(
      "SELECT name, id FROM organizations WHERE created_by = ?",
      [user_uuid]
    );
    if (!results || results[0].length === 0) {
      return {
        success: true,
        message: "No organizations found",
        data: [],
        count: 0,
      };
    }
    return {
      success: true,
      data: results,
      count: results.length,
      message: `Found ${results.length} organization(s)`,
    };
  } catch (err) {
    logger.error(
      "Error listing organizations for user %s: %s",
      user_uuid,
      err.message
    );
    const error = new Error("Failed to fetch organizations");
    error.status = 500;
    error.originalError = err;
    throw error;
  }
};

// list org details
exports.listOrgDetails = async (user_uuid, org_id) => {
  try {
    // 1️⃣ Check membership
    const [memberRows] = await db.query(
      "SELECT role FROM organization_members WHERE org_id = ? AND user_id = ?",
      [org_id, user_uuid]
    );

    if (memberRows.length === 0) {
      throw Object.assign(
        new Error("Organization not found or access denied"),
        { status: 403 }
      );
    }
    const userRole = memberRows[0].role;

    // 2️⃣ Fetch organization details
    const [orgRows] = await db.query(
      "SELECT id, name, created_by, created_at, updated_at FROM organizations WHERE id = ?",
      [org_id]
    );

    if (orgRows.length === 0) {
      throw Object.assign(new Error("Organization not found"), { status: 404 });
    }

    const org = orgRows[0]; // first row
    org.user_role = userRole; // add the member’s role

    return org; // service returns raw data
  } catch (err) {
    logger.error(
      "Error fetching org %s for user %s: %s",
      org_id,
      user_uuid,
      err.message
    );
    throw err;
  }
};

