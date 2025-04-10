const Profile = require("../models/Profile");
const Project = require("../models/Project");
const Kanban = require("../models/Kanban");
const mongoose = require("mongoose");
module.exports = {
  getProjects: async (req, res) => {
    try {
      // Find the profile of the currently authenticated user
      const userProfile = await Profile.findOne({
        googleId: req.user.googleId,
      });

      // Handle case where profile is not found
      if (!userProfile) {
        return res.status(404).send("Profile not found. Try logging in again.");
      }
      // Find all projects where adminId or userId matches the user's profile _id
      const projectList = await Project.find({
        $or: [
          { adminId: new mongoose.Types.ObjectId(userProfile._id) },
          { userId: new mongoose.Types.ObjectId(userProfile._id) },
        ],
      });

      // console.log(projectList);
      res.render("project_template", { projectList: projectList });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  // newProject: (req, res) => {
  //   res.render("project_template.ejs");
  // },
  createProject: async (req, res) => {
    try {
      console.log(
        "trying to create a project now************************************projectController createProject",
        req
      );
      const { name, description, startDate, endDate, status } = req.body;
      // console.log("got:", name, description, startDate, endDate, status);
      // now the user won't have to type his name
      const userProfile = await Profile.findOne({
        googleId: req.user.googleId,
      });
      // console.log("userProfile:", userProfile);
      //incase the user is found...
      if (!userProfile) {
        return res
          .status(404)
          .send("Profile not found. Try logining in again.");
      }
      const newProject = new Project({
        name,
        description,
        startDate,
        endDate,
        status,
        adminId: userProfile._id,
      });
      console.log(
        "create project newProject:",
        newProject._id,
        "********************************************projectController createProject"
      );
      await newProject.save();
      //all these are so the ejs have the isAuthenticated to test so log out will out if logged in.
      console.log("CreateProject new project info", newProject);

      const newKanban = new Kanban({
        projectId: newProject._id,
        columns: [],
      });
      console.log("Create Kanban new kanban info", newKanban);
      try {
        await newKanban.save();
        console.log("Kanban saved successfully!");
    } catch (error) {
        console.error("Error saving Kanban:", error);
    }
    
      console.log('saved a new kanban')
      res.redirect("/profile");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  getProject: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      console.log(
        "get Project",
        project,
        "req.params.id ",
        req.params.id,
        "*******************************projectController getProject"
      );
      res.render("project_template", {
        project,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  updateProject: async (req, res) => {
    try {
      const { name, description, startDate, endDate, status } = req.body;
      await Project.findByIdAndUpdate(req.params.id, {
        name,
        description,
        startDate,
        endDate,
        status,
      });
      res.redirect("/projects");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  deleteProject: async (req, res) => {
    console.log(
      "req.params.id to delete",
      req.params.id,
      "***************************projectController deleteProject"
    );
    try {
      await Project.findByIdAndDelete(req.params.id);
      res.redirect("/projects");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  getKanban: async (req, res) => {
    try {
      const kanban = await Kanban.find({projectId: req.params.id});
      // const kanban = JSON.stringify(await Kanban.find({projectId: req.params.id}));
      const project = await Project.findById(req.params.id);
        // console.log("req.params.id", req.params.id,"kanban",JSON.stringify(kanban));

      res.render("kanban_template", {
        project,
       kanban,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (err) {
      console.error(err);
      req.status(500).send("Server Error");
    }
  },
  /*getProjects: async (req, res) => {
    try {
      // Find the profile of the currently authenticated user
      const userProfile = await Profile.findOne({
        googleId: req.user.googleId,
      });

      // Handle case where profile is not found
      if (!userProfile) {
        return res.status(404).send("Profile not found. Try logging in again.");
      }
      // Find all projects where adminId or userId matches the user's profile _id
      const projectList = await Project.find({
        $or: [
          { adminId: new mongoose.Types.ObjectId(userProfile._id) },
          { userId: new mongoose.Types.ObjectId(userProfile._id) },
        ],
      });

      // console.log(projectList);
      res.render("project_template", { projectList: projectList });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }, */
  updateKanban: async (req, res) => {
    try {
      const { projectId, columns } = req.body;

      const updatedKanban = await Kanban.findByIdAndUpdate(
        { projectId: projectId },
        { columns: columns },
        { new: true, upsert: true });
        req.app.get('socketio').emit(`updateBoard-${projectId}`, updatedKanban);

    } catch (err) {
      console.error("Error updating Kanban:", error);

      res.status(500).send("Server Error");
    }
  },
};
