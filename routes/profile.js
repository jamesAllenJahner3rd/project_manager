router.get('/', ensureAuth, async (req, res) => {
    try {
        // Get all projects with their columns and documents
        const projectList = await Project.find({ adminId: req.user._id })
            .populate({
                path: 'columns',
                populate: {
                    path: 'documents',
                    options: { sort: { 'position': 1 } }
                }
            })
            .lean();

        res.render('profile', {
            projectList,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// Add a route to get project data
router.get('/project/:id/data', ensureAuth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate({
                path: 'columns',
                populate: {
                    path: 'documents',
                    options: { sort: { 'position': 1 } }
                }
            });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}); 