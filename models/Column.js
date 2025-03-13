const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    backgroundColor: {
        type: String,
        default: '#f9f9f9'
    },
    position: {
        type: Number,
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }]
});

// Add index for better query performance
ColumnSchema.index({ projectId: 1, position: 1 });

module.exports = mongoose.model('Column', ColumnSchema); 