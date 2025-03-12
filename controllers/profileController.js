const Profile = require("../models/Profile");
const Project = require("../models/Project");
const mongoose = require("mongoose");
const Document = require("../models/Document");


module.exports = {
    getProfile: async (req, res) => {
        console.log("Fetching profile...");

        try {
            const profile = await Profile.findOne({ googleId: req.user.googleId });
            if (!profile) {
                return res.redirect('/auth/google');
            }

            console.log("User Profile Found:", profile);
            console.log("User Profile ID:", profile._id);

            // Get all projects where user is admin
            const projectList = await Project.find({ adminId: profile._id })
                .populate('columns');

            res.render("profile", {
                user: req.user,
                profile,
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
            const result = await Project.findByIdAndDelete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getProjectData: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json(project);
        } catch (error) {
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
    }
};