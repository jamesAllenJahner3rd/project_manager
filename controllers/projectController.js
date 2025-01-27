const Project = require('../models/Project');

module.exports = {
    getProjects: async (req, res) => {
        try {
            const projects = await Project.find();
            res.render('projects/index', { projects });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    },
    newProject: (req, res) => {
        res.render('projects/new');
    },
    createProject: async (req, res) => {
        try {
            const { name, description, startDate, endDate, status } = req.body;
            const newProject = new Project({
                name,
                description,
                startDate,
                endDate,
                status
            });
            await newProject.save();
            res.redirect('/projects');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    },
    getProject: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            res.render('projects/show', { project });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
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
                status
            });
            res.redirect('/projects');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    },
    deleteProject: async (req, res) => {
        try {
            await Project.findByIdAndDelete(req.params.id);
            res.redirect('/projects');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }
};