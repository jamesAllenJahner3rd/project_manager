const Project = require('../models/Project');

module.exports = {
    getProfile: async (req, res) => {
        try {
            console.log("trying to get the profile");
            const projects = await Project.find({ user: req.user.id });
            //all these are so the ejs have the isAuthenticated to test so log out will out if logged in.
            res.render('profile', {
                projects,
                isAuthenticated: req.isAuthenticated()
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
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
                status
            });
            await newProject.save();
            res.redirect('/profile', { isAuthenticated: req.isAuthenticated() });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }

};


