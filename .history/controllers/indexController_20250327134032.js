module.exports = {
    getIndex: (req, res) => {
        res.render('index.ejs', {
            user: req.user // Pass the user object from the session
        })
    }
}
//