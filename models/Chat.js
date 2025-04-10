const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    Room: {
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

module.exports = mongoose.model('Column', ColumnSchema); 