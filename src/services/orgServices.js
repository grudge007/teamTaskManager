const { SCHEMA_TEXT_FIELD_PHONETIC } = require("redis");
const db = require("../config/db");
const logger = require("../utils/logger");

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
    console.log(`uuid = ${user_uuid}, orgid = ${org_id}`);
    const [results] = await db.query(
      "SELECT * FROM organizations WHERE id = ? AND created_by = ?",
      [org_id, user_uuid]
    );
    if (!results || results.length === 0) {
      throw new Error("Organization not found or access denied");
    }
    const orgDetails = results[0];

    logger.info(
      "Organization details fetched for org %s by user %s",
      org_id,
      user_uuid
    );

    return {
      success: true,
      data: orgDetails,
      message: "Organization details fetched successfully",
    };
  } catch (err) {
    logger.error(
      "Error fetching organization details for org %s by user %s: %s",
      org_id,
      user_uuid,
      err.message
    );

    // Re-throw with proper context
    const error = new Error(
      `Failed to fetch organization details: ${err.message}`
    );
    error.status = err.status || 500;
    error.originalError = err;
    throw error;
  }
};
