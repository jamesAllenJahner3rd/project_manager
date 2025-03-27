module.exports = {
    getIndex: (req,res)=>{
    //all these are so the ejs have the isAuthenticated to test so log out will out if logged in.
        res.render('index.ejs', { isAuthenticated: req.isAuthenticated() } );
    }
}
//