const Profile = require('../models/Profile');
const Project = require('../models/Project');

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
            res.render('/project_template.ejs', { projectList: projectList  });
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
            console.log("trying now");
            const {name,description, startDate, endDate, status } = req.body;
            console.log("got:",name,description, startDate, endDate, status);
            // now the user won't have to type his name
            const userProfile = await Profile.findOne({googleId:req.user.googleId});
            console.log("userProfile:",userProfile);
            //incase the user is found...
            if(!userProfile) {
                return res.status(404).send("Profile not found. Try logining in again.");
            }
            const newProject = new Project({
                name,
                description,
                startDate,
                endDate,
                status,
                adminId :userProfile._id
            });
            console.log("newProject:",newProject);
            await newProject.save();
             //all these are so the ejs have the isAuthenticated to test so log out will out if logged in.
            res.redirect( '/profile' );
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    },
    getProject: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            res.render('projects/show', { project, isAuthenticated: req.isAuthenticated() });
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