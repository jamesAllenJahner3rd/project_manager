const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const { ensureAuth } = require('../middleware/auth')

router.put('/profileCreation', ensureAuth, postController.profileCreation) 

module.exports = router
//