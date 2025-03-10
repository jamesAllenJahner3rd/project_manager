const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
// const dragula = require("dragula");

const indexRoutes = require('./routes/indexRoutes');
const profileRoutes = require('./routes/profileRoutes');
const loginRoutes = require('./routes/loginRoutes');
const postRoutes = require('./routes/postRoutes');
const projectRoutes = require('./routes/projectRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); 

const morgan = require('morgan')
const connectDB = require("./config/database");
const ejs =require("ejs");


const authRoutes = require("./routes/auth");
const path = require("path");
// load the config
dotenv.config({ path: './config/.env' });

//Passport config
require("./config/passport")(passport)//i'm passing variable passport as an arguement

connectDB();

const app = express();
const PORT = process.env.PORT ||  8000;


if (process.env.NODE_ENV ==='development'){
    app. use(morgan('dev'))
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));
 
// Log each request to see the flow
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// View engine
app.set('view engine', 'ejs');

//Express-session middleware
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      //this was stoping us from being logged in as true
      cookie: { secure: false },
      //this was required do to an updated module
      store: MongoStore.create({ mongoUrl: process.env.DB_STRING  }),
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
app.use(express.static(path.join(__dirname,"public")));

// Routes
app.use('/', indexRoutes);
app.use('/auth',authRoutes);
app.use('/profile', profileRoutes);
app.use('/login', loginRoutes);
app.use('/post', postRoutes);
app.use('/project', projectRoutes);
app.post('/profile/project/:id', (req, res) => {
    const projectId = req.params.id;
    const updatedData = req.body;
  
    // Update the project in the database
    Project.findByIdAndUpdate(projectId, updatedData, { new: true })
      .then(project => {
        res.json({ success: true });
      })
      .catch(err => {
        res.status(500).json({ success: false, error: err.message });
      });
  });

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

//NODE_ENV is going to let us know what stage of development we're in when booting.
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));