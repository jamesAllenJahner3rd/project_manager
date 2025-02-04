module.exports = {
    getLogin: (req,res)=>{
        //all these are so the ejs have the isAuthenticated to test so log out will out if logged in.
        res.render('login.ejs', { isAuthenticated: req.isAuthenticated() } )
    },
    getLogout: (req,res)=>{
        res.render('index.ejs', { isAuthenticated: req.isAuthenticated() } )
    },
    postLogin: (req,res)=>{
        res.render('profile.ejs', { isAuthenticated: req.isAuthenticated() })
    }
    // ,
    // getProfileCreation:(req,res)=>{
    //     res.render('profileCreation.ejs', { isAuthenticated: req.isAuthenticated() })
    // }
}
//