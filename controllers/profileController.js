const Profile = require("../models/Profile");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const Document = require("../models/Document");

module.exports = (io) => {
  return {
    getProfile: async (req, res) => {
      console.log("Fetching profile...");
      try {
        const userProfile = await Profile.findOne({
          googleId: req.user.googleId,
        });

        if (!userProfile) {
          console.error("No profile found for this user.");
          return res
            .status(404)
            .send("Profile not found. Try logging in again.");
        }

        // console.log("User Profile Found:", userProfile);
        // console.log("User Profile ID:", userProfile._id);

        // Ensure ObjectId format
        const userId = new mongoose.Types.ObjectId(userProfile._id);

        // Fetch projects
        const projectList = await Project.find({
          $or: [{ adminId: userId }, { userId: userId }],
        });
        const notificationList = await Notification.find({
          userId,
          status: "New",
        });

        // console.log("Projects fetched from DB:", projectList);

        res.render("profile", {
          userProfile,
          projectList,
          notificationList,
          isAuthenticated: req.isAuthenticated(),
        });
      } catch (err) {
        console.error("Error in getProfile:", err);
        res.status(500).send("Server Error");
      }
    },

    createProfile: async (req, res) => {
      try {
        const { name, description, startDate, endDate, status } = req.body;
        const newProject = new Project({
          user: req.user.id,
          name,
          description,
          startDate,
          endDate,
          status,
        });
        await newProject.save();
        res.redirect("/profile", { isAuthenticated: req.isAuthenticated() });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
      }
    },
    editProject: async (req, res) => {
      try {
        const project = await Project.findById(req.params.id);
        if (!project) {
          return res.status(404).send("Project not found");
        }
        res.render("editProject", { project });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
      }
    },

    updateProject: async (req, res) => {
      try {
        const { name, description, startDate, endDate, status } = req.body;
        const project = await Project.findByIdAndUpdate(
          req.params.id,
          { name, description, startDate, endDate, status },
          { new: true, runValidators: true }
        );

        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        res.redirect("/profile");
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    },

    deleteProject: async (req, res) => {
      try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
      }
    },

    getProjectData: async (req, res) => {
      try {
        console.log("Received project ID:", req.params.id);
        const project = await Project.findById(req.params.id).lean();
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
        let a = project;
        console.log("a", a);
        console.log("project", `${project}`);
        res.json(project);
      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
    },

    createDocument: async (req, res) => {
      try {
        const { title, content, columnId } = req.body;
        // Get the count of existing documents in the column for ordering
        const count = await Document.countDocuments({ columnId });

        const newDocument = new Document({
          title,
          content,
          columnId,
          order: count,
          createdBy: req.user._id,
        });

        await newDocument.save();
        res.json(newDocument);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
      }
    },

    updateDocument: async (req, res) => {
      try {
        const { title, content, status } = req.body;
        const document = await Document.findByIdAndUpdate(
          req.params.id,
          { title, content, status },
          { new: true }
        );
        res.json(document);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
      }
    },

    deleteDocument: async (req, res) => {
      try {
        await Document.findByIdAndDelete(req.params.id);
        res.json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
      }
    },

    updateDocumentOrder: async (req, res) => {
      try {
        const { order, columnId } = req.body;
        const document = await Document.findByIdAndUpdate(
          req.params.id,
          { order, columnId },
          { new: true }
        );
        res.json(document);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
      }
    },
    addNotification: async (req, res) => {
      // console.log("addNotification profileController.js line 182", req.params.id);
      try {
        const {
          status,
          projectName,
          createdAt,
          userId,
          projectId,
          userEmail: requestedUserEmail,
          userType,
          sender,
        } = req.body;
        let user = await Profile.findOne({ email: req.params.id });
        // console.log(user);
        if (!user) {
          throw new Error("Can't find user profile Controler.js line 197");
        }
        const newNotification = new Notification({
          status,
          projectName,
          createdAt,
          userId: user._id,
          projectId,
          userName: user.username,
          userEmail: req.params.id,
          userType,
          sender,
        });
        // console.log(`${user._id}`,{
        //   noteID: newNotification._id,
        //   requestedUserId : user._id,
        //   displayName: user.displayName
        // })
        await newNotification.save();

        // console.log("Active rooms:", io.sockets.adapter.rooms);
        // io.emit("notificationAlert", { noteID: "test", displayName: "Server Test" });
        let userIdString = `${user._id}`; //, user._id.toString)
        // console.log("userId line 224 profileController addnotification",userIdString)
        io.to(userIdString).emit("notificationAlert", {
          noteID: newNotification._id,
          requestedUserId: user._id,
          displayName: user.displayName,
        });
        res.status(201).json({
          success: true,
          message: "Notification added successfully",
          noteID: newNotification._id,
        });
        // res.redirect("/project", { isAuthenticated: req.isAuthenticated() });
      } catch (err) {
        console.error(err);
        req.status(500).json({ error: "Server Error" });
      }
    },
    getId: async (req, res) => {
      // console.log("googleId", req.user.googleId);

      const userProfile = await Profile.findOne({
        googleId: req.user.googleId,
      });
      // console.log(userProfile)
      res.json(userProfile._id);
    },
  };
};
