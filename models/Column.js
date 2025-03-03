const mongoose = require('mongoose')

const ColumnSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true
  }, 
  // documents: [Document.schema], 
  createdAt: {
    type: Date, 
    default: Date.now
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', 
    required: true
  }
});

const Column = mongoose.model('Column', ColumnSchema);
module.exports = Column;