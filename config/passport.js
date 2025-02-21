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
                console.log(profile);
              const newUser = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value,
                    // Add a unique username, for example using the display name
                    username: profile.displayName.toLowerCase().replace(/\s+/g, '') // Replace spaces with empty string and convert to lowercase
                
                }
                // search for an existing id
                try{
                    let user = await User.findOne({ googleId: profile.id })
                    // return user 
                    if (user) {
                        //done  signals the completion. null make no errors. user is what was found
                        done(null,user)
                        // or create user
                    }else{
                        user = await User.create(newUser)
                        done(null,user)
                    }
                } catch(err){ 
                    console.error(`Error  ${err}`)
                }
            }
        )
    )
    passport.serializeUser((user, done) => done(null, user.id));

    //this had to change due to mongoose not allowing call backs of findByID
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}