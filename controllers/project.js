const Project = require('../models/Project')
const Column = require('../models/Column')
const Document = require('../models/Document')

module.exports = {
    createProject: async (req, res) => {
        try {
            const project = await Project.create({
                name: req.body.name,
                description: req.body.description,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                status: req.body.status,
                user: req.user.id
            })
            res.json(project)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Error creating project' })
        }
    },

    getProject: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id)
                .populate({
                    path: 'columns',
                    populate: {
                        path: 'documents'
                    }
                })
            res.json(project)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Error getting project' })
        }
    },

    createColumn: async (req, res) => {
        try {
            const column = await Column.create({
                title: req.body.title,
                backgroundColor: req.body.backgroundColor,
                position: req.body.position,
                project: req.params.projectId
            })
            
            await Project.findByIdAndUpdate(
                req.params.projectId,
                { $push: { columns: column._id } }
            )
            
            res.json(column)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Error creating column' })
        }
    },

    createDocument: async (req, res) => {
        try {
            const document = await Document.create({
                title: req.body.title,
                content: req.body.content,
                backgroundColor: req.body.backgroundColor,
                position: req.body.position,
                column: req.params.columnId
            })
            
            await Column.findByIdAndUpdate(
                req.params.columnId,
                { $push: { documents: document._id } }
            )
            
            res.json(document)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Error creating document' })
        }
    }
} 