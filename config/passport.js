const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const User = require("../models/Profile.js");

module.exports = function(passport){// this was passed in from the app.js
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL:"/auth/google/callback"
            },

            async(accessToken, RefreshToken, profile, done) => {
                console.log("--- Google Profile Received ---");
                console.dir(profile, { depth: null });

                const email = profile.emails && profile.emails[0] && profile.emails[0].value;
                
                console.log("Extracted email:", email);

                if (!email) {
                    console.error("Email field is missing or empty in Google profile data!");
                    return done(new Error("Email not provided by Google"), null);
                }

                const newUser = {
                    provider: 'google', // Set provider


                    googleId: profile.id,
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: email.toLowerCase(), // Add email
                    // Generate a unique username if needed, or handle potential collisions
                    // Using email part before @ as a simple default, ensure it's unique later if necessary
                    username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''), 
                    image: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    // No password for Google users
                };

                try {
                    // Step 1: Find ANY user with this googleId
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // User with this googleId EXISTS
                        if (user.provider === 'google') {
                            // Correct provider, log them in
                            console.log('Existing Google user found:', user);
                            return done(null, user);
                        } else {
                            // Incorrect/missing provider - conflict!
                            console.warn(`Conflict: User with googleId ${profile.id} exists but provider is not 'google' (provider: ${user.provider}).`);
                            // Don't log in, don't create new user. Send specific error.
                            return done(null, false, { message: 'Account conflict. Please contact support or try logging in differently.' });
                        }
                    } else {
                        // NO user found with this googleId. Proceed to check by email and create.
                        
                        // Optional: Check if a local user exists with the same email
                        const existingEmailUser = await User.findOne({ email: newUser.email, provider: 'local' });
                        if (existingEmailUser) {
                           // Handle case: User already signed up locally with this email.
                           console.warn(`User tried Google login but already exists locally with email: ${newUser.email}`);
                           return done(null, false, { message: 'An account with this email already exists. Please log in using your username and password.' });
                        }
                        
                        // Optional: Check if generated username already exists (ensure unique)
                        let potentialUsername = newUser.username;
                        let usernameExists = await User.findOne({ username: potentialUsername });
                        let suffix = 1;
                        while (usernameExists) {
                            potentialUsername = `${newUser.username}${suffix}`;
                            usernameExists = await User.findOne({ username: potentialUsername });
                            suffix++;
                        }
                        newUser.username = potentialUsername; 

                        // Create the new Google user
                        console.log('Creating new Google user:', newUser);
                        user = await User.create(newUser);
                        console.log('New Google user created successfully:', user);
                        return done(null, user);
                    }
                } catch (err) {
                    // Handle other potential errors during database operations
                    console.error(`Error during Google auth processing: ${err}`);
                    // Check if it's the specific duplicate key error we already handled conceptually
                    // Although the logic above should prevent reaching User.create() if googleId exists,
                    // this catch is a fallback.
                    if (err.code === 11000 && err.keyPattern && err.keyPattern.googleId) {
                         console.error("Caught duplicate googleId error unexpectedly. Check logic.");
                         return done(null, false, { message: 'An account issue occurred. Please try again or contact support.' });
                    } else if (err.code === 11000 && err.keyPattern && (err.keyPattern.email || err.keyPattern.username)) {
                         // This might happen if the email/username check fails under race conditions
                         console.error("Caught duplicate email/username error during Google signup.");
                         return done(null, false, { message: 'Email or username already associated with another account.' });
                    }                    
                    // General error
                    return done(err);
                }
            }
        )
    )

    // Local Strategy (ensure email is used if usernameField is email)
    passport.use(new LocalStrategy({ usernameField: 'username' /* or 'email' if logging in with email */ }, async (usernameOrEmail, password, done) => {
        try {
            // Find user by username OR email (adjust based on login field)
            const query = usernameOrEmail.includes('@') 
                ? { email: usernameOrEmail.toLowerCase(), provider: 'local' } 
                : { username: usernameOrEmail.toLowerCase(), provider: 'local' };
                
            const user = await User.findOne(query);
            
            if (!user) {
                return done(null, false, { message: `Incorrect username or password.` }); // Keep messages generic for security
            }
            
            // User must have a password (i.e., be a local user)
            if (!user.password) {
                 // This case should technically not happen if query includes provider: 'local'
                 // but good as a safeguard
                return done(null, false, { message: 'Account error. Please contact support.' }); 
            }

            // Compare password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) return done(err);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect username or password.' });
                }
            });
        } catch (err) {
            console.error("Error during local login:", err);
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        console.log(`--- Serializing User --- ID: ${user.id}`);
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        console.log(`--- Deserializing User --- ID: ${id}`);
        try {
            const user = await User.findById(id);
             if (!user) {
                 console.warn(`DeserializeUser: User not found for ID: ${id}`);
                 return done(null, false); // Indicate user not found
             }
            console.log('DeserializeUser: User found:', user.username);
            done(null, user);
        } catch (err) {
            console.error(`DeserializeUser Error for ID: ${id}`, err);
            done(err, null);
        }
    });
}