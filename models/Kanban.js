const mongoose = require("mongoose");

const KanbanSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  columns: {
    type: Array,
    default:[],
    required: false,
  },
});

// Add a pre-save hook to ensure every document has a status
KanbanSchema.pre('save', function(next) {
  //i  was getting errors of these not being arrays since they were empty 
  if(!Array.isArray(this.columns)){
    this.columns = []
  }

  // let statusMap ={}
  debugger
  console.log("this.columns",this.columns)
  if (this.columns && Array.isArray(this.columns)) {
    // Ensure each document in each column has a status
    this.columns.forEach((column, colIndex) => {
//i  was getting errors of these not being arrays since they were empty 
      if (!Array.isArray(column.documents)) {
        column.documents =[]
      }
        column.documents.forEach(doc => {
          // If status is missing, set based on column index
          if (!doc.status) {
            const statusMap = {
              0: "to_do",
              1: "in_progress", 
              2: "testing",
              3: "done"
            };
            doc.status = statusMap[colIndex] || "to_do";
          }
        });
      
    });
  }
  next();
});

module.exports = mongoose.model("Kanban", KanbanSchema);
