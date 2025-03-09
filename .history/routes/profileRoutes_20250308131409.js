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
router.post('/profile/project/:id', async (req, res) => {
    try {
      const projectId = req.params.id;
      const updatedProject = await Project.findByIdAndUpdate(projectId, req.body, { new: true });
      res.json({ success: true, project: updatedProject });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  });
  
module.exports = router;