// Import required modules
require('dotenv').config();
const Joi = require("joi");
require("../utils.js");
const { isLoggedIn } = require("./login");

// Define error messages
const errorMessages = {
  emptyUserName: 'Please provide a name',
}

// Define signup validation schema using Joi
const signupScheme = Joi.object({
  username: Joi.string().min(3).max(20).required(),
});

/**
 * Middleware function for validating profile edits.
 * Validates the username in the request body using the signupScheme.
 * Renders an error message if the validation fails or if the username is empty.
 * Calls the next middleware function if validation succeeds.
 * @author Heesun Lee
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const editProfileValidation = async (req, res, next) => {
  // Extract the username from the request body
  let username = req.body.username;

  // Validate the username using the signupScheme
  const validationResult = signupScheme.validate({ username });

  let errorMessage = '';

  // If there is an empty input or error
  if (validationResult.error != null) {
    if (username.length < 1) {
      // Set the error message to indicate an empty username
      errorMessage = errorMessages.emptyUserName;
    } else {
      // Set the error message to the validation error message
      errorMessage = validationResult.error.message;
    }

    // Render the signup-submit template with the error message
    res.render('signup-submit', { signupFail: true, errorMessage, isLoggedIn: isLoggedIn(req) });
    console.log('error');
    return;
  }

  // Call the next middleware function
  next();
  console.log('success');
}

// Export the editProfileValidation function
module.exports = {
  editProfileValidation
}
