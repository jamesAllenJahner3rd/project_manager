const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require("mongoose");
const User = require("../models/Profile.js");

module.exports = function(passport){// this was passed in from the app.js
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL:"/auth/google/callback"
            },
            async(accessToken, RefreshToken, profile,done)=>{
// done is the callback we call for the we need to  finish.
              const newUser = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value
                }
                // search for an existing id
                try{
                    let user = await User.findOne({ googleId: profile.id })
                    // return user 
                    if (user) {
                        done(null,user)
                        // or create user
                    }else{
                        user = await User.create(newUser)
                        done(null,user)
                    }
                } catch(err){// 
                    console.error(`Error  ${err}`)
                }
            }
        )
    )
    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((user, done) =>{
        User.findById(id,(err,user) => done(err, user));
    });
}