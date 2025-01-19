const Profile = require('../models/Profile');

module.exports = {
    getProfile: (req, res) => {
        res.render('profile.ejs');
    },
    createProfile: async (req, res) => {
        try {
            const { username, password, name, email, timeZone, birthday } = req.body;
            const newProfile = new Profile({
                username,
                password,
                name,
                email,
                timeZone,
                birthday
            });
            await newProfile.save();
            res.redirect('/');
        } catch (err) {
            console.error('Error creating profile:', err);
            res.status(500).send('Server Error');
        }
    }
}