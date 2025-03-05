const mongoose = require('mongoose')

const ColumnSchema = new mongoose.Schema({
  title: {
    type: String, 
    required: true
  }, 
  columnID: {
    type: String, 
    required: true
  }, 
  // documents: [Document.schema], 
  createdAt: {
    type: Date, 
    default: Date.now
  },
  kanbanID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', 
    required: true
  },
  
  // documents: [Document.schema], 
});

const Column = mongoose.model('Column', ColumnSchema);
module.exports = Column;