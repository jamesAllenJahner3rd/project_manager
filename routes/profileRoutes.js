const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController'); // Ensure this path is correct
const { ensureAuth } = require('../middleware/auth')


// routes for logged in user creating new project
router.get('/', ensureAuth, profileController.getProfile);
router.post('/project', ensureAuth, profileController.createProfile);

// routes for making changes to existing projects
router.get('/project/:id/edit', ensureAuth, profileController.editProject);
router.put('/project/:id', ensureAuth, profileController.updateProject);
router.delete('/project/:id/delete', ensureAuth, profileController.deleteProject);
router.get('/project/:id/data', ensureAuth, profileController.getProjectData);

// Document routes
router.post('/project/:id/document', ensureAuth, profileController.createDocument);
router.put('/document/:id', ensureAuth, profileController.updateDocument);
router.delete('/document/:id', ensureAuth, profileController.deleteDocument);
router.put('/document/:id/order', ensureAuth, profileController.updateDocumentOrder);

module.exports = router;