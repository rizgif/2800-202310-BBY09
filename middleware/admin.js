function isAdmin(req) {
  if (req.session.user_type == 'admin') {
    return true;
  }
  return false;
}

function adminAuthorization(req, res, next) {
  if (!isAdmin(req)) {
    res.status(403);
    res.render("errorMessage", {error: "Not Authorized"});
    return;
  }
  else {
    next();
  }
}

module.exports = {
  isAdmin,
  adminAuthorization
}