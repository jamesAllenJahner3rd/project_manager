const Profile = require("../models/Profile");
const Project = require("../models/Project");
const mongoose = require("mongoose");

module.exports = {
    getProfile: async (req, res) => {
        console.log("Fetching profile...");

        try {
            const userProfile = await Profile.findOne({ googleId: req.user.googleId });

            if (!userProfile) {
                console.log("No profile found for this user.");
                return res.status(404).send("Profile not found. Try logging in again.");
            }

            console.log("User Profile Found:", userProfile);
            console.log("User Profile ID:", userProfile._id);

            // Ensure ObjectId format
            const userId = new mongoose.Types.ObjectId(userProfile._id);

            // Fetch projects
            const projectList = await Project.find({
                $or: [{ adminId: userId }, { userId: userId }]
            });

            console.log("Projects fetched from DB:", projectList);

            res.render("profile", {
                userProfile,
                projectList,
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
                return res.status(404).send('Project not found');
            }
            res.render('editProject', { project });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
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
                return res.status(404).json({ message: 'Project not found' });
            }

            res.redirect('/profile');
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    deleteProject: async (req, res) => {
        try {
            await Project.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};