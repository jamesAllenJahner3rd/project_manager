const Profile = require("../models/Profile");
const Project = require("../models/Project");
const Kanban = require("../models/Kanban");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const projectController = require("./projectController");
module.exports = {
  getProjects: async (req, res) => {
    try {
      // Find the profile of the currently authenticated user

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
        "name",
        newProject.name,
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

      console.log("saved a new kanban");
      res.redirect("/profile");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  getProject: async (req, res) => {
    console.log(`projectcontroller getproject line 123`);
    let accessLevel = null;
    try {
      const userProfile = await Profile.findOne({
        googleId: req.user.googleId,
      });

      const project = await Project.findById(req.params.id);
      console.log(
        "test accessLevel projectController line 102",
        userProfile._id,
        project.adminId,
        `${userProfile._id}` === `${project.adminId}`
      );

      if (project.adminId.map((e) => `${e}`).includes(`${userProfile._id}`)) {
        accessLevel = "admin";
      } else if (`${userProfile._id}` === `${project.userId}`) {
        accessLevel = "user";
      } else {
        console.error(" Client isn't labeled as User or Admin");
      }

      // console.log(
      //   "included",
      //   project.adminId.map((id) => id.toString()),
      //   userProfile.toString()
      // );

      res.render("project_template", {
        project,
        accessLevel: accessLevel,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  /**getProjectInfo: async (req, res) => {
    console.log("projectController getProjectInfo line 110", "req.params.id", req.params);

    try {
        // Fetch project data from MongoDB
        const project = await Project.findById(req.params.id); // Renamed response to project for clarity
        
        if (!project) {
            // Respond with 404 if project not found
            return res.status(404).json({ error: "Project not found" });
        }

        console.log("projectController getProjectInfo line 110", project, "req.params.id", req.params.id);

        // Respond with project data as JSON
        res.json(project);
    } catch (err) {
        // Log and respond with 500 Internal Server Error
        console.error(err, "ERROR projectController getProjectInfo");
        res.status(500).json({ error: "Server Error", details: err.message });
    }
};*/
  // getProjectInfo: async (req, res) => {
  //   console.log(
  //     "projectController getProjectInfo line 110",
  //     "req.params.id",
  //     req.params
  //   );
  //   try {
  //     const { id } = req.params;
  //     if (!mongoose.Types.ObjectId.isValid(id)) {
  //       return res.status(400).json({ error: "Invalid Project ID" });
  //     }
  //     const response = await Project.findById(id);
  //     if (!response) {
  //       return res.status(404).json({ error: "Project not found" });
  //     }
  //     // const project = response.json();
  //     console.log(
  //       "projectController getProjectInfo line 110",
  //       response,
  //       "req.params.id",
  //       req.params.id
  //     );

  //     res.json(response);
  //   } catch (err) {
  //     console.error(
  //       err,
  //       "ERROR projectController getProjectInfo chat.js line 13"
  //     ); // Log for debugging
  //     res.status(500).json({ error: "Server Error", details: err.message });
  //   }
  // },
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
    let accessLevel = null;
    try {
      const userProfile = await Profile.findOne({
        googleId: req.user.googleId,
      });
      if (!userProfile) {
        return res
          .status(404)
          .send("userProfile not found projectConroller getKanban line 221");
      }
      const kanban = await Kanban.find({ projectId: req.params.id });
      if (!kanban.length) {
        return res
          .status(404)
          .send("kanban not found projectConroller getKanban line 227");
      }
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res
          .status(404)
          .send("Project not found projectConroller getKanban line 233");
      }
      if (project.adminId.map((e) => `${e}`).includes(`${userProfile._id}`)) {
        accessLevel = "admin";
      } else if (`${userProfile._id}` === `${project.userId}`) {
        accessLevel = "user";
      } else {
        console.error(" Client isn't labeled as User or Admin");
      }
      let listOfTeamMembersID = [...project.adminId].concat([
        ...project.userId,
      ]);
      console.log(listOfTeamMembersID);
      ;
      let listOfTeamMembers = await Promise.all(
        listOfTeamMembersID.map(async (id) => {
          console.log(`List of id ${id}`);
          const profile = await Profile.findById(id);
          console.log(`List of profile ${profile.email}`);
          return profile.displayName;
        })
      );
      let listOfTeam = new Set(listOfTeamMembers);
      listOfTeamMembers = Array.from(listOfTeam);
      console.log(`List of team ${listOfTeamMembers}`);

      res.render("kanban_template", {
        project,
        kanban,
        isAuthenticated: req.isAuthenticated(),
        accessLevel: accessLevel,
        listOfTeamMembers: listOfTeamMembers,
        userName: userProfile.displayName,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  getKanbanData: async (req, res) => {
    try {
      const kanban = await Kanban.find({ projectId: req.params.id });
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res
          .status(404)
          .send("Kanban not found projectConroller getKanbanData line 219");
      }

      res.json(kanban[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  updateKanban: async (req, res) => {
    try {
      const { projectId, columns } = req.body;

      const updatedKanban = await Kanban.findOneAndUpdate(
        { projectId: projectId },
        { columns: columns },
        { new: true, upsert: true }
      );

      if (!updatedKanban) {
        return res.status(404).send("Kanban not found");
      }

      req.app.get("socket.io").emit("board-updated", updatedKanban);
      res.json(updatedKanban);
    } catch (err) {
      console.error("Error updating Kanban:", err);
      res.status(500).send("Server Error");
    }
  },
  getAssignee: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).send("Project not found");
      }

      const ListOfAssignees = [...project.userId, ...project.adminId];

      const profiles = await Profile.find({
        _id: { $in: ListOfAssignees },
      }).select("displayName");
      console.log(profiles);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching assignees:", error);
      res.status(500).send("Server Error");
    } finally {
      console.log("getAssignee function executed successfully");
    }
  },
  addUser: async (req, res) => {
    let notificationObjectId = null;
    const { notificationId } = req.body; // Extract from request
    console.log(
      `adduser projectController.js line 172 ${JSON.stringify(req.body)}`
    );
    if (mongoose.Types.ObjectId.isValid(notificationId)) {
      notificationObjectId = new mongoose.Types.ObjectId(notificationId);
      // console.log("Converted ObjectId:", notificationObjectId);
    } else {
      console.error("Invalid ObjectId:", notificationId);
    }
    try {
      const notificationDocument = await Notification.findOne({
        _id: notificationObjectId,
      });
      // console.log("addUser  req.body projectController.js line 185", req.user.googleId,"notificationDocument",notificationDocument);

      const { status, projectId, projectName, userId, userType } =
        notificationDocument;
      // console.log("status, projectId ,projectName, userId, userType",status, projectId ,projectName, userId, userType);

      const projectObjectId = new mongoose.Types.ObjectId(projectId);
      const updateField =
        userType === "adminId"
          ? { $addToSet: { adminId: userId } }
          : { $addToSet: { userId: userId } };
      const updatedProjectUsers = await Project.findOneAndUpdate(
        { _id: projectId },
        updateField,
        { new: true, upsert: false }
      );
      if (!updatedProjectUsers) {
        return res.status(404).json({ error: "Project not found" });
      }

      // console.log("Updated Project", updatedProjectUsers.name);

      res.status(200).json({
        message: `User added as ${userType}`,
        project: updatedProjectUsers,
      });
    } catch (err) {
      console.error(
        ` ${err} I Can't connect to find users. projectController.js line 211`
      );
      res
        .status(500)
        .json({ error: "Server error. Unable to add user to project." });
    }
  },
  ageNotification: async (req, res) => {
    console.log(
      "notificationId, agaNotification projectController.js line 225",
      req.body
    );
    try {
      let CurrentNotification = await Notification.findOneAndUpdate(
        { _id: req.body.notificationId },
        { status: "Old" },
        { new: true, upsert: true }
      );
      console.log("userId", CurrentNotification.userId);
      const { userId } = CurrentNotification;
      const notificationList = await Notification.find({
        userId,
        status: "New",
      });

      console.log("notificationList:", notificationList);
      // console.log("userId:", req.body.userId);

      res.json(JSON.stringify(notificationList, userId));
      // res.json({ message: "Notification updated successfully", notification: req.body.notificationId });
    } catch (err) {
      console.log("You got and error:", err);
    }
  },
  edit: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      res.render("projects/edit", { project });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  },
  isAdmin: async (req,res) => {
    console.log(`isAdmin started and the id is ${req.params.id}`)
    try{const project = await Project.findById(req.params.id);
      console.log(`isAdmin started and the project is ${project}`)
    console.log("Project value:", project);
console.log("Type of project:", typeof project);
      if(!project){
      throw new Error('500 project not found')
    }
    
   const userProfile = await Profile.findOne({
      googleId: req.user.googleId,
    });
    console.log(`isAdmin started and the userProfile is ${userProfile}`)
    if(!userProfile){
      throw new Error ( '500 profile not found')
    }
    console.log (userProfile)
    res.send(project.adminId.some(id => id.toString().includes(userProfile._id.toString())));

  }catch(error){
    console.error( `Error the profile or project wasn't able to be found, ${error}`)
  }finally{
    console.log(`is Admin finished running`)
  }
  }
};
