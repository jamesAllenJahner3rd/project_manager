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

// Update project route
router.put('/project/:id', async (req, res) => {
    try {
        // Only select the fields we want to update
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            status: req.body.status
        };

        // Use findByIdAndUpdate with specific options
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { 
                new: true, // Return the updated document
                runValidators: true, // Run model validations
                select: 'name description startDate endDate status' // Only return these fields
            }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Error updating project' });
    }
}); 