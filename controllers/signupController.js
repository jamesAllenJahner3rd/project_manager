const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/Profile");

const saltRounds = 10;

module.exports = {
  getSignup: (req, res) => {
    res.render("signup.ejs", {
      errors: req.flash ? req.flash("error") : [], // Handle case where flash might not be configured
      formData: req.flash ? req.flash("formData")[0] : {}, // Pass back form data on error
    });
  },

  postSignup: async (req, res, next) => {
    // Destructure required fields, including new ones
    const { username, password, confirmPassword, email, firstName, lastName } =
      req.body;
    const errors = [];

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      errors.push({ msg: "Please fill in all fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push({ msg: "Please enter a valid email address" });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (username && !usernameRegex.test(username)) {
      errors.push({
        msg: "Username can only contain letters, numbers, and underscores",
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      errors.push({ msg: "Passwords do not match" });
    }

    // Validate password length
    if (password && password.length < 6) {
      errors.push({ msg: "Password must be at least 6 characters" });
    }

    if (errors.length > 0) {
      // Pass back entered data to the view
      const formData = { username, email, firstName, lastName }; // Don't pass back passwords
      // If using connect-flash, store errors and form data in flash
      if (req.flash) {
        req.flash(
          "error",
          errors.map((e) => e.msg)
        );
        req.flash("formData", formData);
        return res.redirect("/signup");
      } else {
        // Otherwise, render the page again with errors and data
        return res.render("signup.ejs", { errors, formData });
      }
    }

    // --- Validation Passed ---
    try {
      // Check if username or email already exists
      const existingUser = await User.findOne({
        $or: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() },
        ],
      });

      if (existingUser) {
        errors.push({ msg: "Username or Email already registered" });
        const formData = { username, email, firstName, lastName };
        if (req.flash) {
          req.flash(
            "error",
            errors.map((e) => e.msg)
          );
          req.flash("formData", formData);
          return res.redirect("/signup");
        } else {
          return res.render("signup.ejs", { errors, formData });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user with updated fields
      const newUser = new User({
        provider: "local",
        username: username.toLowerCase(),
        password: hashedPassword,
        email: email.toLowerCase(),
        firstName: firstName,
        lastName: lastName,
        displayName: `${firstName} ${lastName}`,
      });

      await newUser.save();
      console.log("Local user registered:", newUser);

      // Log in the user directly
      req.login(newUser, function (err) {
        if (err) {
          console.error("Error during auto-login:", err);
          if (req.flash) {
            req.flash(
              "error_msg",
              "Registration successful but login failed. Please try logging in manually."
            );
          }
          return res.redirect("/login");
        }
        if (req.flash) {
          req.flash(
            "success_msg",
            "Registration successful! Welcome to your new account."
          );
        }
        return res.redirect("/profile");
      });
    } catch (err) {
      console.error("Error during local signup:", err);
      const formData = { username, email, firstName, lastName };
      if (err.code === 11000) {
        // Handle duplicate key error (likely username/email)
        errors.push({ msg: "Username or Email already exists." });
      } else {
        errors.push({
          msg: "An error occurred during registration. Please try again.",
        });
      }
      if (req.flash) {
        req.flash(
          "error",
          errors.map((e) => e.msg)
        );
        req.flash("formData", formData);
        return res.redirect("/signup");
      } else {
        return res.render("signup.ejs", { errors, formData });
      }
    }
  },
};
