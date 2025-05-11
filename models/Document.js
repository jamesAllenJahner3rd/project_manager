const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  documentId: {
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
  description: {
    type: String,
    default: "Description:",
  },
  columnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Column",
    required: true,
  },
  // position: {
  //     type: Number,
  //     required: true
  // },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
  },
});

module.exports = mongoose.model("Document", DocumentSchema);
