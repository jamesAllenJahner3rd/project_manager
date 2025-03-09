const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    columnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    }
});

module.exports = mongoose.model('Document', DocumentSchema);