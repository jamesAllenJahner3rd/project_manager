const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuth } = require('../middleware/auth');

// routes for logged in user creating new project
router.get('/', ensureAuth, profileController.getProfile);
router.post('/project', ensureAuth, profileController.createProfile);
// routes for making changes to existing projects
router.get('/project/:id/edit', ensureAuth, profileController.editProject);
router.put('/project/:id', ensureAuth, profileController.updateProject);
router.delete('/project/:id/delete', ensureAuth, profileController.deleteProject);

module.exports = router;