const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  viewedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["New", "Old"],
    default: "New",
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  userEmail: {
    type: String,
    ref: "Profile",
    required: true,
  },
  userType: {
    type: String,
    enum: ["userId", "AdminId"],
    default: "userId",
  },
  blockedIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  ],
  sender: {
    type: String,
    ref: "Profile",
    required: true,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
