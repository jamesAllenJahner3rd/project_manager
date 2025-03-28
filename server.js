const express = require("express"); //providing tools to handle requests, routes, and middleware
const mongoose = require("mongoose"); //providing schemas and models to structure your data
const methodOverride = require("method-override"); //allows you to use HTTP verbs like PUT and DELETE in places where the client or browser doesn't support them.
const dotenv = require("dotenv"); // loads environment variables from a  file into .
const session = require("express-session"); // store user data on the server temporarily while they interact with a web application
const MongoStore = require("connect-mongo"); //allows you to store session data in a MongoDB database
const passport = require("passport"); // authentication middleware for Node.js.
// const dragula = require("dragula");

const indexRoutes = require("./routes/indexRoutes");
const profileRoutes = require("./routes/profileRoutes");
const loginRoutes = require("./routes/loginRoutes");
const postRoutes = require("./routes/postRoutes");
const projectRoutes = require("./routes/projectRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware"); //example of destrtucturing

const morgan = require("morgan"); // useful for debugging and monitoring server activity.
const connectDB = require("./config/database"); //custom function used in projects to establish a connection to a database
const ejs = require("ejs");

const authRoutes = require("./routes/auth");
const path = require("path"); // provides utilities to work with file and directory paths,
// load the config
dotenv.config({ path: "./config/.env" }); // setting a path to .env

//Passport config
require("./config/passport")(passport); //i'm passing variable passport as an arguement

connectDB(); // calls the function to connect to the database.  by separating it cleans up server.js

const app = express(); // initializes an Express application and assigns it to the variable
const PORT = process.env.PORT || 8000; // we do this so that we don't have to hard code the port

// check if we are running the dev version
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // express is setting up morgan for debugging.
}

// Middleware
app.use(express.urlencoded({ extended: true })); //Express app wouldn’t automatically parse URL-encoded data from form submissions
app.use(express.json()); //Parses JSON data from requests and makes it available in req.body
app.use(methodOverride("_method")); //allows the use of delete and put in the submit forms
app.use("/public", express.static("public")); // setups  the folder to hold static files.

// Log each request to see the flow for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// View engine
app.set("view engine", "ejs"); //so we can use ejs.

//Express-session middleware
app.use(
  session({
    // UPDATE THIS TO .ENV INSTEAD OF HARDCODING------------------------------------
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    //this was stoping us from being logged in as true

    // UPDATE THIS TO TRUE DURING PRODUCTION-------------------------------------------
    cookie: { secure: false },
    //this was required do to an updated module
    store: MongoStore.create({ mongoUrl: process.env.DB_STRING }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Add this middleware before your route definitions
//the partials weren't recieving the to isAuthenticated.
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

//static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/login", loginRoutes);
app.use("/post", postRoutes);
app.use("/project", projectRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

//NODE_ENV is going to let us know what stage of development we're in when booting.
app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
