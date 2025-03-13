exports.createColumn = async (req, res) => {
    try {
        // Create the column
        const column = await Column.create({
            title: req.body.title,
            projectId: req.params.projectId,
            position: 0 // or whatever position logic you have
        });

        // Update the project with the new column
        await Project.findByIdAndUpdate(
            req.params.projectId,
            { $push: { columns: column._id } },
            { new: true }
        );

        console.log('Created column:', column);
        console.log('Updated project columns');

        res.status(201).json(column);
    } catch (error) {
        console.error('Error creating column:', error);
        res.status(500).json({ error: 'Failed to create column' });
    }
}; 