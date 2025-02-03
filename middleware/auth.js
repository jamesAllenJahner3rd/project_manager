module.exports = {
  //corrected indention
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/')
    }
  },
  //I needed to keep the logged in user from returning to the login page.
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()){
      res.redirect("/profile")
    }else {
      return next()
    }
  }
}