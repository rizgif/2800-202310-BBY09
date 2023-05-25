// Import required modules
require('dotenv').config();
const Joi = require("joi");
require("../utils.js");
const bcrypt = require("bcrypt");
const mongodb_database = process.env.MONGODB_DATABASE;

// Define login validation schema using Joi
const loginScheme = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required()
});

// Define error messages
const errorMessages = {
  emptyUserEmail: 'Please provide an email',
  emptyPassword: 'Please provide a password',
}

/**
 * Checks if the user is logged in based on the authentication status in the request session.
 * @author Heesun Lee
 * @param {Object} req - The request object.
 * @returns {boolean} True if the user is logged in, false otherwise.
 */
function isLoggedIn(req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

/**
 * Middleware function for validating login credentials.
 * Validates the email and password in the request body using the loginScheme.
 * Renders an error message if the validation fails or if the email or password is empty.
 * Checks if the user exists in the database and if the password is correct.
 * Calls the next middleware function if validation and database checks succeed.
 * @author Heesun Lee
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const loginValidation = async (req, res, next) => {
  // Extract the email and password from the request body
  let email = req.body.email;
  let password = req.body.password;

  let errorMessage = {};
  const validationResult = loginScheme.validate({ email, password });

  if (validationResult.error != null) {
    if (email.length < 1) {
      // Set the error message to indicate an empty email
      errorMessage = errorMessages.emptyUserEmail;
    } else if (password.length < 1) {
      // Set the error message to indicate an empty password
      errorMessage = errorMessages.emptyPassword;
    } else {
      // Set the error message to the validation error message
      errorMessage = validationResult.error.message;
    }
    // Render the login-submit template with the error message
    res.render('login-submit', { errorMessage, isLoggedIn: isLoggedIn(req) });
    return;
  }

  // Check if the user exists in the database
  let { database } = include('databaseConnection');
  const userCollection = database.db(mongodb_database).collection('users');
  const result = await userCollection.find({ email: email }).project({ password: 1, _id: 1 }).toArray();

  // If the user does not exist
  if (result.length != 1) {
    errorMessage = 'Can not find the user.';
    // Render the login-submit template with the error message
    res.render('login-submit', { errorMessage, isLoggedIn: isLoggedIn(req) });
    return;
  }

  // Check if the password is correct
  if (!await bcrypt.compare(password, result[0].password)) {
    errorMessage = 'Invalid id/password combination';
    // Render the login-submit template with the error message
    res.render('login-submit', { errorMessage, isLoggedIn: isLoggedIn(req) });
    return;
  }

  // Call the next middleware function
  next();
}

// Export the isLoggedIn and loginValidation functions
module.exports = {
  isLoggedIn,
  loginValidation
}
