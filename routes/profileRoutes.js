const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, profileController.getProfile);
router.delete('/project/:id/delete', ensureAuth, profileController.deleteProject);

module.exports = router;