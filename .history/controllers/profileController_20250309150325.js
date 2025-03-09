const Profile = require("../models/Profile");
const Project = require("../models/Project");
const mongoose = require("mongoose");
const Document = require("../models/Document");


module.exports = {
    getProfile: async (req, res) => {
        try {
            const userProfile = await Profile.findOne({ googleId: req.user.googleId });
            if (!userProfile) {
                return res.status(404).send("Profile not found");
            }

            const userId = new mongoose.Types.ObjectId(userProfile._id);
            const projectList = await Project.find({
                $or: [{ adminId: userId }, { userId: userId }]
            });

            console.log('Projects found:', projectList); // Debug log

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
                userId: req.user._id,
                name,
                description,
                startDate,
                endDate,
                status,
            });
            await newProject.save();
            res.redirect("/profile");
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },
    editProject: async (req, res) => {
        try {
            console.log('Edit project ID:', req.params.id); // Debug log
            const project = await Project.findById(req.params.id);
            
            if (!project) {
                console.log('Project not found'); // Debug log
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json(project);
        } catch (err) {
            console.error("Error in editProject:", err);
            res.status(500).json({ error: 'Server error' });
        }
    },

    updateProject: async (req, res) => {
        try {
            const { name, description, startDate, endDate, status } = req.body;
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { name, description, startDate, endDate, status },
                { new: true }
            );

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json(project);
        } catch (err) {
            console.error("Error in updateProject:", err);
            res.status(500).json({ error: 'Server error' });
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
    },

    getProjectData: async (req, res) => {
        try {
            console.log('Getting project data for ID:', req.params.id); // Debug log
            const project = await Project.findById(req.params.id);
            
            if (!project) {
                console.log('Project not found'); // Debug log
                return res.status(404).json({ error: 'Project not found' });
            }
            
            res.json(project);
        } catch (err) {
            console.error("Error in getProjectData:", err);
            res.status(500).json({ error: 'Server error' });
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
                createdBy: req.user._id
            });
            
            await newDocument.save();
            res.json(newDocument);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
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
            res.status(500).json({ error: 'Server Error' });
        }
    },

    deleteDocument: async (req, res) => {
        try {
            await Document.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
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
            res.status(500).json({ error: 'Server Error' });
        }
    },

    getProject: async (req, res) => {
        try {
            console.log('Getting project with ID:', req.params.id);
            
            // Validate MongoDB ID
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                console.log('Invalid project ID format');
                return res.status(400).json({ message: "Invalid project ID" });
            }

            const project = await Project.findById(req.params.id);
            console.log('Found project:', project);

            if (!project) {
                console.log('Project not found');
                return res.status(404).json({ message: "Project not found" });
            }

            // If you want to render a view
            res.render("project", { 
                project, 
                isAuthenticated: req.isAuthenticated() 
            });

        } catch (err) {
            console.error("Error in getProject:", err);
            res.status(500).json({ message: "Server Error", error: err.message });
        }
    },

    createProject: async (req, res) => {
        try {
            const { name, description, startDate, endDate, status } = req.body;
            const newProject = new Project({
                userId: req.user._id,
                adminId: req.user._id,
                name,
                description,
                startDate,
                endDate,
                status,
            });
            await newProject.save();
            res.redirect("/profile");
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
};