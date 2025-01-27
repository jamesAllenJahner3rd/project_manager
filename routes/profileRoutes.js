const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController'); // Ensure this path is correct

<<<<<<< HEAD
router.get('/', profileController.getProfile);
router.post('/createProject', profileController.createProject);
=======
router.get('/', profileController.getProfile) 
router.post('/profileCreation', profileController.createProfile);
>>>>>>> de99171c43413c9c19681de196c2ecd360e65a3d

module.exports = router;