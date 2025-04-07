const mongoose = require("mongoose");

const KanbanSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  columns: {
    type: Array,
    required: false,
  },
});

module.exports = mongoose.model("Kanban", KanbanSchema);
