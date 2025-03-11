const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuth } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);
    next();
});

// Routes
router.get('/', ensureAuth, profileController.getProfile);
router.post('/project', ensureAuth, profileController.createProfile);
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