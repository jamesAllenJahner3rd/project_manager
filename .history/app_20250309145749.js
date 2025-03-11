const express = require('express');
const app = express();
const profileRoutes = require('./routes/profileRoutes');

// Required middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');

// Static files
app.use(express.static('public'));

// Mount routes - make sure this is correct
app.use('/profile', profileRoutes); 