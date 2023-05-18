
require('dotenv').config();
const Joi = require("joi");
require("../utils.js");
const {isLoggedIn} = require("./login");

const errorMessages = {
  emptyPassword: 'Please provide a password',
  emptyEmail: 'Please provide an email address',
  emptyUserName: 'Please provide a user name',
}

const signupScheme = Joi.object({
  password: Joi.string().min(2).max(20).required(),
  email: Joi.string().email().required(),
  username: Joi.string().min(2).max(20).required(),
});

const signupValidation = async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  let username = req.body.username;

  const validationResult = signupScheme.validate({username, email, password});

  let errorMessage = '';

  // if there is an empty input or error
  if (validationResult.error != null) {
    if (password.length < 1) {
      errorMessage = errorMessages.emptyPassword;
    } else if (email.length < 1) {
      errorMessage = errorMessages.emptyEmail;
    } else if (username.length < 1) {
      errorMessage = errorMessages.emptyUserName;
    } else {
      errorMessage = validationResult.error.message;
    }
    res.render('signup-submit', { signupFail: true, errorMessage, isLoggedIn: isLoggedIn(req) });
    return;
  }

  next();
}

module.exports = {
  signupValidation
}