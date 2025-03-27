const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Column = require('../models/Column');
const Document = require('../models/Document');
const { ensureAuth } = require('../config/auth');

// Get project with all its data
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate({
                path: 'columns',
                populate: {
                    path: 'documents',
                    options: { sort: { 'position': 1 } }
                }

            });

        if (!project) {
            return res.render('error/404');
        }

        res.render('project_template', {
            project,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.render('error/404');
    }
});

// Create new column
router.post('/:projectId/columns', async (req, res) => {
    try {
        const count = await Column.countDocuments({ projectId: req.params.projectId });
        const column = new Column({
            title: req.body.title,
            backgroundColor: req.body.backgroundColor,
            position: count,
            projectId: req.params.projectId
        });
        
        const savedColumn = await column.save();
        await Project.findByIdAndUpdate(req.params.projectId, {
            $push: { columns: savedColumn._id }
        });
        
        res.json(savedColumn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update column
router.put('/columns/:id', async (req, res) => {
    try {
        const column = await Column.findByIdAndUpdate(req.params.id, {
            backgroundColor: req.body.backgroundColor,
            position: req.body.position
        }, { new: true });
        res.json(column);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create document
router.post('/columns/:columnId/documents', async (req, res) => {
    try {
        const count = await Document.countDocuments({ columnId: req.params.columnId });
        const document = new Document({
            title: req.body.title,
            content: req.body.content,
            columnId: req.params.columnId,
            position: count,
            createdBy: req.user._id
        });
        
        const savedDocument = await document.save();
        await Column.findByIdAndUpdate(req.params.columnId, {
            $push: { documents: savedDocument._id }
        });
        
        res.json(savedDocument);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update document position
router.put('/documents/:id', async (req, res) => {
    try {
        const document = await Document.findByIdAndUpdate(req.params.id, {
            columnId: req.body.columnId,
            position: req.body.position
        }, { new: true });
        res.json(document);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Move document between columns
router.put('/documents/:id/move', async (req, res) => {
    try {
        const { newColumnId, oldColumnId, position } = req.body;
        
        // Update document's column and position
        const document = await Document.findByIdAndUpdate(req.params.id, {
            columnId: newColumnId,
            position: position
        }, { new: true });

        // Remove document from old column
        await Column.findByIdAndUpdate(oldColumnId, {
            $pull: { documents: req.params.id }
        });

        // Add document to new column
        await Column.findByIdAndUpdate(newColumnId, {
            $push: { documents: req.params.id }
        });

        res.json(document);
    } catch (err) {
        console.error('Error moving document:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update document position within same column
router.put('/documents/:id/position', async (req, res) => {
    try {
        const document = await Document.findByIdAndUpdate(req.params.id, {
            position: req.body.position
        }, { new: true });
        
        res.json(document);
    } catch (err) {
        console.error('Error updating document position:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/createProject', ensureAuth, async (req, res) => {
}); 