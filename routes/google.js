const express = require('express')
const router = express.Router()
const indexController = require('../controllers/indexController')
const { ensureAuth } = require('../middleware/auth')

router.get('/callback',profileController.getProfile) 

module.exports = router
//