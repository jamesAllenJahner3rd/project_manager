const Profile = require('../models/Profile');
const Project = require('../models/Project');
const mongoose = require('mongoose');
const Column = require('../models/Column');
const Document = require('../models/Document');

module.exports = {
    getProjects: async (req, res) => {
        try {
           // Find the profile of the currently authenticated user
           const userProfile = await Profile.findOne({ googleId: req.user.googleId });

           // Handle case where profile is not found
           if (!userProfile) {
               return res.status(404).send("Profile not found. Try logging in again.");
           }
           // Find all projects where adminId or userId matches the user's profile _id
           const projectList = await Project.find({
            $or: [
                { adminId: new mongoose.Types.ObjectId(userProfile._id) },
                { userId: new mongoose.Types.ObjectId(userProfile._id) }
              ]
        });
            
            console.log(projectList);
            res.render('project_template', { projectList: projectList  });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    },
    newProject: (req, res) => {
        res.render('project_template.ejs');
    },
    createProject: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Validate request body
            if (!req.body.name || !req.body.description || !req.body.startDate || !req.body.endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Create the project
            const project = await Project.create({
                name: req.body.name,
                description: req.body.description,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                status: req.body.status,
                userId: req.user._id,
                columns: []
            });

            // Send response based on request type
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(201).json({
                    success: true,
                    project: project
                });
            }

            // For regular form submissions, redirect
            return res.redirect('/profile');

        } catch (err) {
            console.error('Project creation error:', err);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }
            // For regular form submissions, redirect with error
            return res.redirect('/profile?error=creation-failed');
        }
    },
    getProject: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id)
                .populate({
                    path: 'columns',
                    populate: {
                        path: 'documents',
                        model: 'Document'
                    }
                });

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            res.json(project);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    updateProject: async (req, res) => {
        try {
            const { name, description, startDate, endDate, status } = req.body;
            const projectId = req.params.id;

            const updatedProject = await Project.findByIdAndUpdate(
                projectId,
                {
                name,
                description,
                startDate,
                endDate,
                status
                },
                { new: true }
            );

            if (!updatedProject) {
                return res.status(404).json({ message: 'Project not found' });
            }

            res.json(updatedProject);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    deleteProject: async (req, res) => {
        try {
            const projectId = req.params.id;
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            // Delete all associated documents first
            for (const columnId of project.columns) {
                const column = await Column.findById(columnId);
                if (column) {
                    await Document.deleteMany({ columnId: column._id });
                }
            }

            // Delete all columns
            await Column.deleteMany({ projectId });

            // Finally delete the project
            await Project.findByIdAndDelete(projectId);

            res.json({ message: 'Project deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    saveProject: async (req, res) => {
        try {
            const { id, columns } = req.body;
            
            const project = await Project.findByIdAndUpdate(
                id,
                { 
                    columns: columns,
                    lastModified: new Date()
                },
                { new: true }
            );

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json({ success: true, project });
        } catch (error) {
            console.error('Error saving project:', error);
            res.status(500).json({ error: 'Failed to save project' });
        }
    },
    createColumn: async (req, res) => {
        try {
            const { title } = req.body;
            const projectId = req.params.projectId;

            // Get the current highest position
            const highestPositionColumn = await Column.findOne({ projectId })
                .sort('-position');
            const newPosition = (highestPositionColumn?.position || 0) + 1;

            const newColumn = new Column({
                title,
                projectId,
                position: newPosition,
                documents: []
            });

            await newColumn.save();

            // Update project with new column
            await Project.findByIdAndUpdate(projectId, {
                $push: { columns: newColumn._id }
            });

            res.status(201).json(newColumn);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    createDocument: async (req, res) => {
        try {
            const { title, content } = req.body;
            const columnId = req.params.columnId;
            
            // Find user profile
            const userProfile = await Profile.findOne({ googleId: req.user.googleId });
            
            if (!userProfile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            // Get the current highest position
            const highestPositionDoc = await Document.findOne({ columnId })
                .sort('-position');
            const newPosition = (highestPositionDoc?.position || 0) + 1;

            const newDocument = new Document({
                title,
                content,
                columnId,
                position: newPosition,
                createdBy: userProfile._id,  // Using Profile reference
                status: 'Not Started'
            });

            await newDocument.save();

            // Update column with new document
            await Column.findByIdAndUpdate(columnId, {
                $push: { documents: newDocument._id }
            });

            res.status(201).json(newDocument);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};