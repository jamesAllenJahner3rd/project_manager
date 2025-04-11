const express = require('express')
const router = express.Router()
const passport = require('passport')
const loginController = require('../controllers/loginController')
const { ensureAuth } = require('../middleware/auth')


router.get('/', loginController.getLogin)
router.post('/', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}))
// router.get('/profileCreation',ensureAuth, loginController.getProfileCreation)
module.exports = router