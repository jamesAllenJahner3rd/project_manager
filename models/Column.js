const mongoose = require("mongoose");

const ColumnSchema = new mongoose.Schema({
  columnId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    default: "#f9f9f9",
  },
  position: {
    type: Number,
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
  ],
  maxDocuments: {
    type: Number,
    default: 0,
  },
  canAddDocuments: {
    type: Boolean,
    default: true,
  },
  canChangeDocumentColor: {
    type: Boolean,
    default: true,
  },
  canDeleteDocuments: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Column", ColumnSchema);