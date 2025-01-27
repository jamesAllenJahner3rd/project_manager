const Project = require('../models/Project');

module.exports = {
    getProfile: async (req, res) => {
        try {
            const projects = await Project.find({ user: req.user.id });
            res.render('profile', { projects });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    },
    createProject: async (req, res) => {
        try {
            const { name, description, startDate, endDate, status } = req.body;
            const newProject = new Project({
                user: req.user.id,
                name,
                description,
                startDate,
                endDate,
                status
            });
            await newProject.save();
            res.redirect('/profile');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }

};



