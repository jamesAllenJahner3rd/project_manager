const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    timeZone: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    }
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;