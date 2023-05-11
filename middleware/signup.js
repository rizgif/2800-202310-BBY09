
require('dotenv').config();
const Joi = require("joi");
require("../utils.js");

const errorMessages = {
  emptyUserName: 'Please provide a user name',
  emptyEmail: 'Please provide an email address',
  emptyPassword: 'Please provide a password',
}

const signupScheme = Joi.object({
  username: Joi.string().alphanum().max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required()
});

const signupValidation = async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  let username = req.body.username;

  const validationResult = signupScheme.validate({username, email, password});

  let errorMessage = '';

  // if there is an empty input or error
  if (validationResult.error != null) {
    if (username.length < 1) {
      errorMessage = errorMessages.emptyUserName;
    } else if (email.length < 1) {
      errorMessage = errorMessages.emptyEmail;
    } else if (password.length < 1) {
      errorMessage = errorMessages.emptyPassword;
    } else {
      errorMessage = validationResult.error.message;
    }
    res.render('signup-submit', { signupFail: true, errorMessage });
    return;
  }

  next();
}

module.exports = {
  signupValidation
}