/**
 * Checks if the session is valid.
 * Returns true if the session is authenticated, false otherwise.
 * @author Heesun Lee
 * @param {Object} req - The request object.
 * @returns {boolean} - Indicates if the session is valid.
 */
function isValidSession(req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

/**
 * Middleware function for validating the session.
 * Checks if the session is valid using the isValidSession function.
 * Calls the next middleware function if the session is valid.
 * Redirects to the login page if the session is not valid.
 * @author Heesun Lee
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 */
function sessionValidation(req, res, next) {
  if (isValidSession(req)) {
    // Call the next middleware function if the session is valid
    next();
  } else {
    // Redirect to the login page if the session is not valid
    res.redirect('/login');
  }
}

// Export the isValidSession and sessionValidation functions
module.exports = {
  isValidSession,
  sessionValidation
};
