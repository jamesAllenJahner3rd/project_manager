const Column = require("../models/Column")
const mongoose = require('mongoose')

module.exports = {
  createColumn: async (req, res) => {
    try {
      await Column.create({
        name: req.body.column, 
        // documents: [],
        projectId: req.params.id
      });
      console.log("Column has been added!")
      res.redirect("/project/" + req.params.id)
    } catch (err) {
      console.error(err)
    }
  }
}
