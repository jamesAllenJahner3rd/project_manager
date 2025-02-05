const express = require('express')
const router = express.Router()
const indexController = require('../controllers/indexController')
const{ensureAuth, ensureGuest} = require('../middleware/auth')
// REmove these comments. This is commented out to it belongs in the controller and rendering the wrong thing

router.get('/',indexController.getIndex) 

module.exports = router
//