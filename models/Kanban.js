const mongoose = require('mongoose')

const KanbanSchema = new mongoose.Schema({
  title: {
    type: String, 
    required: true
  }, 
  kanbanID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project', 
      required: true
    },
  createdAt: {
    type: Date, 
    default: Date.now
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', 
    required: true
  },
  columns: [ColumnSchema], 
});

const Kanban = mongoose.model('kanban', KanbanSchema);
module.exports = Kanban;