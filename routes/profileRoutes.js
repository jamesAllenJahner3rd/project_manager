const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController'); // Ensure this path is correct

router.get('/', profileController.getProfile);
router.post('/createProject', profileController.createProject);

module.exports = router;