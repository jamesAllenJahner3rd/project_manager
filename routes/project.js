const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Project = require('../models/Project');
const Column = require('../models/Column');
const Document = require('../models/Document');

// Create column
router.post('/:projectId/columns', ensureAuth, async (req, res) => {
    try {
        const column = await Column.create({
            ...req.body,
            projectId: req.params.projectId
        });
        
        await Project.findByIdAndUpdate(
            req.params.projectId,
            { $push: { columns: column._id } }
        );
        
        res.json(column);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create project
router.post('/createProject', ensureAuth, async (req, res) => {
    try {
        const project = await Project.create({
            ...req.body,
            adminId: req.user.googleId
        });
        res.json(project);
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get project data
router.get('/:projectId/data', ensureAuth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate({
                path: 'columns',
                populate: {
                    path: 'documents'
                }
            });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create document
router.post('/columns/:columnId/documents', ensureAuth, async (req, res) => {
    try {
        const document = await Document.create({
            ...req.body,
            createdBy: req.user.googleId
        });
        
        await Column.findByIdAndUpdate(
            req.params.columnId,
            { $push: { documents: document._id } }
        );
        
        res.json(document);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update column positions
router.put('/:projectId/columns/positions', ensureAuth, async (req, res) => {
    try {
        const updates = req.body.updates;
        for (const update of updates) {
            await Column.findByIdAndUpdate(update.id, { position: update.position });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete document
router.delete('/documents/:documentId', ensureAuth, async (req, res) => {
    try {
        await Document.findByIdAndDelete(req.params.documentId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete column
router.delete('/columns/:columnId', ensureAuth, async (req, res) => {
    try {
        const column = await Column.findById(req.params.columnId);
        // Delete all documents in the column
        await Document.deleteMany({ _id: { $in: column.documents } });
        // Delete the column
        await Column.findByIdAndDelete(req.params.columnId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 