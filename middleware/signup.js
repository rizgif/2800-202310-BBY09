/**
 * Loads environment variables from the .env file.
 */
require('dotenv').config();

const Joi = require("joi");
require("../utils.js");
const { isLoggedIn } = require("./login");

const errorMessages = {
  emptyPassword: 'Please provide a password',
  emptyEmail: 'Please provide an email address',
  emptyUserName: 'Please provide a name',
};

const signupScheme = Joi.object({
  password: Joi.string().min(4).max(20).required(),
  email: Joi.string().email().min(5).required(),
  username: Joi.string().min(3).max(20).required(),
});

/**
 * Middleware function for validating the signup data.
 * Validates the email, password, and username using the signupScheme.
 * If there are any validation errors or empty inputs, it renders the signup-submit page with the appropriate error message.
 * Calls the next middleware function if the validation is successful.
 * @author Heesun Lee
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const signupValidation = async (req, res, next) => {
  let email = req.body.email?.trim();
  let password = req.body.password;
  let username = req.body.username.trim();

  const validationResult = signupScheme.validate({ username, email, password });

  let errorMessage = '';

  // If there is an empty input or error
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

  // Call the next middleware function if the validation is successful
  next();
};

// Export the signupValidation function
module.exports = {
  signupValidation
};
