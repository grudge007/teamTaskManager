// teamController.js
exports.createTeam = async (req, res, next) => {
  res.json({ message: "Team created", user: req.user });
};
