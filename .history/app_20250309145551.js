const express = require('express');
const app = express();
const profileRoutes = require('./routes/profileRoutes');

// Make sure you have these middleware configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register the profile routes
app.use('/profile', profileRoutes); 