const express = require('express')
const router = express.Router();
const projectController = require('../controllers/projectController');
const { ensureAuth } = require('../middleware/auth'); // Assuming you have auth middleware

router.get('/', projectController.getProjects)
router.get('/new', projectController.newProject);

// Middleware to ensure JSON responses
const ensureJSON = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
};

router.post('/createProject', ensureAuth, projectController.createProject);

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
router.post('/project/:id/save', projectController.saveProject);

module.exports = router;