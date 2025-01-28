const express = require("express");
const router = express.Router();
const passport = require("passport");
//@desc Auth with Google
//@router GET /auth/google     ?this listens for the '/' tand triggers the response
router.get("/google", passport.authenticate("google", { scope: ['profile'] } ));//strategy, then asking for profile data

//@desc Google auth callback
//@router GET /auth/google/callback
router.get("/google/callback", passport.authenticate("google",{failureRedirect: "/"}), //if it fails go to  root
(req,res) =>{
    res.redirect("/");
}); // but if it passes go to the dashboard
// an object specifying a failure redirect.
module.exports = router;