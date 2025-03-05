const mongoose = require('mongoose')

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String, 
    required: true
  }, 
    documentID: {
    type: String, 
    required: true
  }, 
  columnID: {
    type: String, 
    required: true
  }, 
  Description: {
    type: String, 
    required: false
  }, 
  createdAt: {
    type: Date, 
    default: Date.now
  },
  Assignee: {
    type: String, 
    required: false
  },
  Label: {
    type: String, 
    required: false
  }, 
  MileStone: {
    type: String, 
    required: false
  }, 
  // documents: [Document.schema], 
});

const Column = mongoose.model('Column', ColumnSchema);
module.exports = Column;