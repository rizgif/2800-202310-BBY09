const session = require("./session.js");
const admin = require("./admin.js");
const login = require("./login.js");
const signup = require("./signup.js");
const review = require("./review.js")


module.exports = {
  ...session,
  ...admin,
  ...login,
  ...signup,
  ...review
};