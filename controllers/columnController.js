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

// ---------------------------
                // fetch('/columns/createColumn/67a25383dacdda28699ff3fc', {
                //     method: 'POST',
                //     headers: {
                //     'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({ name: columnName }), // Send the captured value
                // })
                // .then(response => response.json())
                // .then(data => {
                //     console.log('Success:', data);
                //     // Handle the response
                // })
                // .catch((error) => {
                //     console.error('Error:', error);
                // });


                
                // console.log(columnContent)

// ---------------------------