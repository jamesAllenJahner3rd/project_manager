const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, profileController.getProfile);
router.post('/project', ensureAuth, profileController.createProject);
router.get('/project/new', ensureAuth, profileController.newProject);
router.get('/project/:id', ensureAuth, profileController.getProject);
router.get('/project/:id/edit', ensureAuth, profileController.editProject);
router.put('/project/:id', ensureAuth, profileController.updateProject);
router.delete('/project/:id', ensureAuth, profileController.deleteProject);

module.exports = router;