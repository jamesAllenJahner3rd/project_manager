const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: ['google', 'local'],
        required: true
    },
    googleId: {
        type: String,
        required: false, 
        unique: true,     
        sparse: true      
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: false 
    },
    lastName: {
        type: String,
        required: false
    },
    email: {             
        type: String,
        required: true,
        unique: true,
        lowercase: true,  
        trim: true       
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
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