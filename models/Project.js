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
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: false
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true
    }, 
    kanbanId: {
        type: String,
        required: false
    },
    timelineID:{
        type: String,
        required: false
    },
    GanttID:{
        type: String,
        required: false
    }
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;