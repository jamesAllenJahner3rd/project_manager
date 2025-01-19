module.exports = {
    getLogin: (req,res)=>{
        res.render('login.ejs')
    },
    postLogin: (req,res)=>{
        res.render('profile.ejs')
    },
    getProfileCreation:(req,res)=>{
        res.render('profileCreation.ejs')
    }
}
//