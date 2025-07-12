const mongoose = require("mongoose");

const KanbanSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  columns: {
    type: Array,
    default: [],
    required: false,
  },
  statusMap: {
    type: Object, // Store dynamically mapped statuses
    default: {}, // Ensure default empty object
  },
});

// Add a pre-save hook to ensure every document has a status
KanbanSchema.pre("save", function (next) {
  if (!Array.isArray(this.columns)) {
    this.columns = [];
  }

  let dynamicStatusMap = {}; // Store column titles dynamically
  this.columns.forEach((column, colIndex) => {
    if (!Array.isArray(column.documents)) {
      column.documents = [];
    }

    column.documents.forEach((doc) => {
      if (!doc.status) {
        doc.status = column.title || "Submit"; // Use column title instead of hardcoded map
      }
    });

    dynamicStatusMap[colIndex] = column.title || "Submit"; // Store dynamic mapping
  });

  this.statusMap = dynamicStatusMap; // Save mapping in MongoDB
  next();
});

module.exports = mongoose.model("Kanban", KanbanSchema);
