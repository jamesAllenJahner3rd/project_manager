const express = require('express')
const router = express.Router()
const indexController = require('../controllers/indexController')
const{ensureAuth, ensureGuest} = require('../middleware/auth')

router.get('/',indexController.getIndex) 

module.exports = router
