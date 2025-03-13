const express = require('express');
const app = express();

// Add these middleware before your routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make sure your content type middleware is set correctly
app.use((req, res, next) => {
    if (req.is('json')) {
        res.setHeader('Content-Type', 'application/json');
    }
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Add middleware to handle JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format'
        });
    }
    next(err);
});

// Add middleware to ensure JSON responses for API routes
app.use('/project', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

const profileRoutes = require('./routes/profileRoutes');

app.use('/profile', profileRoutes);

// Routes
app.use('/project', require('./routes/projectRoutes')); 