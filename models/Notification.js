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
    required: true,
  },
  blockedIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  ],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
   userName: {
    type: String,
    ref: "Profile",
    required: true,
  },
  userType: {
    type: String,
    enum: ["userId", "AdminId"],
    default: "userId",
  },
  sender: {
    type: String,
    ref: "Profile",
    required: true,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
