function isLoggedIn (req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

module.exports = {
  isLoggedIn
}