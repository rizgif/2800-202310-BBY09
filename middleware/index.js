const session = require("./session.js");
const admin = require("./admin.js");
const login = require("./login.js");


module.exports = {
  ...session,
  ...admin,
  ...login,
};