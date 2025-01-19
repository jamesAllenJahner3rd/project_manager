const express = require('express');
const app = express();

const methodOverride = require("method-override");

//const connectDB = require('/config/database');
const indexRoutes = require('./routes/indexRoutes');
const profileRoutes = require('./routes/profileRoutes');
const loginRoutes = require('./routes/loginRoutes');
const postRoutes = require("./routes/postRoutes");

const PORT = 8000;

require('dotenv').config({path: './config/.env'});


// EJS Engine
app.set('view engine', 'ejs');

// middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// routes
app.use('/', indexRoutes);
app.use('/profile', profileRoutes);
app.use('/login', loginRoutes);
app.use("/post", postRoutes)

// start server
app.listen(process.env.PORT||8000, ()=>{
    console.log('Server is running, you better catch it!')
});
