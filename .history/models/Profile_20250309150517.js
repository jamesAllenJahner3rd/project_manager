const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    googleId:{
        type: String,
        required: true
    },
    displayName:{
        type: String,
        required: true
    },
     firstName:{
        type: String,
        required: true
    },
     lastName:{
        type: String,
        required: true
    },
     image:{
        type: String
        
    },
    createdAt:{
        type: Date,
        default:Date.now()
    },
    username:{
        type: String,
OK        required: true
    }

})

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;