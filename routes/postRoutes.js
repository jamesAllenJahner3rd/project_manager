const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')

router.put('/profileCreation', postController.profileCreation) 

module.exports = router