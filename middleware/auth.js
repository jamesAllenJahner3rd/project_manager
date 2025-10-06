// Authentication middleware for route protection
module.exports = {
  // Allow only logged-in users
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  },
  // Prevent logged-in users from visiting guest routes (like login/signup)
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect("/profile");
    } else {
      return next();
    }
  },
};
