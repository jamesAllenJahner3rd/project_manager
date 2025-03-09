const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, profileController.getProfile);
router.post('/project', ensureAuth, profileController.createProject);
router.get('/project/:id/edit', ensureAuth, profileController.editProject);router.get('/project/:id/edit', ensureAuth, profileController.editProject);
router.put('/project/:id', ensureAuth, profileController.updateProject);', ensureAuth, profileController.updateProject);
router.delete('/project/:id/delete', ensureAuth, profileController.deleteProject);router.delete('/project/:id/delete', ensureAuth, profileController.deleteProject);

module.exports = router;