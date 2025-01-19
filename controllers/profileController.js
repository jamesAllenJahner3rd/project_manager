module.exports = {
    getProfile: (req, res) => {
        res.render('profile.ejs');
    },
    createProfile: (req, res) => {
        const { username, password, passwordRepeat, name, email, timeZone } = req.body;
        // Add logic to handle profile creation, e.g., save to database
        res.redirect('/');
    }
}