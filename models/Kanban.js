const mongoose = require("mongoose");

const KanbanSchema = new mongoose.Schema({
  kanbanId: {
    type: String,
    required: true,
  },
  columns: {
    type: Array,
    required: false,
  },
});

module.exports = mongoose.model("Kanban", KanbanSchema);
