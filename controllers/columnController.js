const Column = require("../models/Column")
const mongoose = require('mongoose')

module.exports = {
  createColumn: async (req, res) => {
    try {
      console.log("Received a request to create a column.");
      console.log("Request body:", req.body); // Log the request body
      const { column } = req.body;
      console.log("got:", column);
      const newColumn = await Column.create({
        name: column, 
        // documents: [],
        projectId: req.params.id
      });
      console.log("column: ", newColumn)
      console.log("Column has been added!")
      res.redirect("/project/" + req.params.id)
    } catch (err) {
      console.error(err)
    }
  }
}