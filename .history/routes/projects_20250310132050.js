const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Column = require('../models/Column');
const Document = require('../models/Document');

// Get project with all its columns and documents
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate({
                path: 'columns',
                populate: {
                    path: 'documents',
                    model: 'Document'
                }
            });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new column
router.post('/:projectId/columns', async (req, res) => {
    try {
        const { title, backgroundColor } = req.body;
        const projectId = req.params.projectId;
        
        // Get the current highest order
        const highestOrder = await Column.findOne({ projectId })
            .sort('-order')
            .select('order');
        
        const newColumn = new Column({
            title,
            projectId,
            backgroundColor,
            order: (highestOrder?.order || 0) + 1
        });
        
        await newColumn.save();
        
        // Add column to project
        await Project.findByIdAndUpdate(projectId, {
            $push: { columns: newColumn._id }
        });
        
        res.json(newColumn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update column (position, color, etc)
router.put('/columns/:columnId', async (req, res) => {
    try {
        const updatedColumn = await Column.findByIdAndUpdate(
            req.params.columnId,
            req.body,
            { new: true }
        );
        res.json(updatedColumn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new document in column
router.post('/columns/:columnId/documents', async (req, res) => {
    try {
        const { title, content } = req.body;
        const columnId = req.params.columnId;
        
        const highestOrder = await Document.findOne({ columnId })
            .sort('-order')
            .select('order');
        
        const newDocument = new Document({
            title,
            content,
            columnId,
            order: (highestOrder?.order || 0) + 1,
            createdBy: req.user._id
        });
        
        await newDocument.save();
        res.json(newDocument);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}); 