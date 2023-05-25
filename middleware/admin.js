/**
 * Checks if the user in the request session has the "admin" user type.
 * @author Heesun Lee
 * @param {Object} req - The request object.
 * @returns {boolean} True if the user is an admin, false otherwise.
 */
function isAdmin(req) {
  if (req.session.user_type == 'admin') {
    return true;
  }
  return false;
}

/**
 * Middleware function for admin authorization.
 * Checks if the user in the request is an admin, and proceeds to the next middleware if authorized.
 * Otherwise, it sets the response status to 403 (Forbidden) and renders an error message.
 * @author Heesun Lee
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 */
function adminAuthorization(req, res, next) {
  if (!isAdmin(req)) {
    // User is not authorized as admin
    res.status(403);
    res.render("errorMessage", { error: "Not Authorized" });
    return;
  } else {
    // User is authorized as admin, proceed to next middleware
    next();
  }
}

// Export the functions as module exports
module.exports = {
  isAdmin,
  adminAuthorization
};
