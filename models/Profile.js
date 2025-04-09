const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: ['google', 'local'],
        required: true
    },
    googleId: {
        type: String,
        required: false, // No longer required for local accounts
        unique: true,     // Keep unique if present
        sparse: true      // Allows multiple null/missing values
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: false // No longer required
    },
    lastName: {
        type: String,
        required: false // No longer required
    },
    email: {             // Added Email field
        type: String,
        required: true,
        unique: true,
        lowercase: true,  // Store emails in lowercase
        trim: true        // Remove whitespace
    },
    username: {          // Added unique constraint
        type: String,
        required: true,
        unique: true,
        lowercase: true,  // Store usernames in lowercase
        trim: true
    },
    password: {
        type: String,
        required: false // Only required if provider is 'local' (handled in controller)
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Profile', ProfileSchema);