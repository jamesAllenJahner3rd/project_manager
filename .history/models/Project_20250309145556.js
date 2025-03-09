const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Not Started', 'In Progress', 'Completed']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true
    }
}, {
    timestamps: true
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;