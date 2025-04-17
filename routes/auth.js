const express = require("express");
const router = express.Router();
const passport = require("passport");
//@desc Auth with Google
//@router GET /auth/google     ?this listens for the '/' tand triggers the response
router.get("/google", passport.authenticate("google", { scope: ['profile', 'email'] } ));//strategy, then asking for profile data

//@desc Google auth callback
//@router GET /auth/google/callback
router.get("/google/callback", 
    (req, res, next) => { // Add logging middleware *before* authenticate
        console.log(`--- Hit /auth/google/callback route ---`);
        console.log("Session ID before authenticate:", req.sessionID);
        console.log("Session data before authenticate:", req.session);
        next(); // Continue to passport.authenticate
    },
    passport.authenticate("google",{failureRedirect: "/"}), //if it fails go to  root
    (req,res) =>{
        // i corrected the redirected page.
        console.log("--- Google Authentication Successful --- "); // Changed log message
        console.log("Session ID after authenticate:", req.sessionID);
        console.log("User after authenticate:", req.user ? req.user.id : 'No user');
        console.log("Redirecting to /profile");
        res.redirect("/profile");
    }
); // but if it passes go to the dashboard
// an object specifying a failure redirect.

//This was required to let the user logout
//@desc Logout user
//@route /auth/logout

router.get("/logout", (req, res, next) => {
    console.log("I'm logging out");
    req.logout((err) => {
      if (err) {
        return next(error);
      }
      res.redirect("/");
    });
  });
module.exports = router;