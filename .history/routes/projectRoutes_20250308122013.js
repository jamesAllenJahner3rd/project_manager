const express = require('express')
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects)
router.get('/new', projectController.newProject);
router.post('/createProject', projectController.createProject); 
router.get('/:id', projectController.getProject);
router.get('/:id/edit', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        res.render('projects/edit', { project });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
// server.js or routes/projectRoutes.js
app.post('/profile/project/:id', (req, res) => {
    const projectId = req.params.id;
    const updatedData = req.body;
  
    // Update the project in the database
    Project.findByIdAndUpdate(projectId, updatedData, { new: true })
      .then(project => {
        res.json({ success: true });
      })
      .catch(err => {
        res.status(500).json({ success: false, error: err.message });
      });
  });
module.exports = router;