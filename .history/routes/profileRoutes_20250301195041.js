const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController'); // Ensure this path is correct
const { ensureAuth } = require('../middleware/auth')

// Route to the profile of the authenticated user
router.get('/', ensureAuth, profileController.getProfile) 

// Route to create a new profile
router.post('/profileCreation', ensureAuth, profileController.createProfile);

// Route to delete a project
router.delete('/project/:id/delete', ensureAuth, profileController.deleteProject);

module.exports = router;