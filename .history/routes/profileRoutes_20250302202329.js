const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, profileController.getProfile);
router.delete('/project/:id/delete', ensureAuth, profileController.deleteProject);
router.get('/project/:id/edit', ensureAuth, profileController.editProject);
router.put('/project/:id/update',ensureAuth, profileController.updateProject);

module.exports = router;