// orgController.js
const { orgCreationSchema } = require("../utils/validator");
const orgServices = require("../services/orgServices");
const logger = require("../utils/logger");

// create organization
exports.createOrg = async (req, res, next) => {
  try {
    const { value, error } = orgCreationSchema.validate(req.body);
    if (error) {
      logger.error("Validation error: %s", error.details[0].message);
      return res.status(400).json(error.details[0].message);
    }
    const newOrg = await orgServices.createOrg(value.org_name, req.user.uuid);
    res.status(201).json({
      newOrg,
    });
  } catch (err) {
    next(err);
  }
};

// list organizations
exports.listOrg = async (req, res, next) => {
  try {
    const orgs = await orgServices.listOrg(req.user.uuid);
    res.json(orgs);
  } catch (err) {
    next(err);
  }
};

// list org details
exports.listOrgDetails = async (req, res, next) => {
  try {
    const listDetails = await orgServices.listOrgDetails(req.user.uuid, req.params.id);
    res.json(listDetails);
  } catch (err) {
    next(err);
  }
};
