const express = require('express')
const router = express.Router()
const loginController = require('../controllers/loginController')
const { ensureAuth } = require('../middleware/auth')


router.get('/', loginController.getLogin)
router.post('/', loginController.postLogin)
// router.get('/profileCreation',ensureAuth, loginController.getProfileCreation)
module.exports = router