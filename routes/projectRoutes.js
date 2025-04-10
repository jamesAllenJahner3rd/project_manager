const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.get("/", projectController.getProjects);
router.get("/kanban:id", projectController.getKanban);
router.put("/kanban:id", projectController.updateKanban);
// router.get('/CFD', projectController.getCFD);
// router.get('/burnup', projectController.getBurnup);
// router.get('/taskAging', projectController.getTaskAging);
// router.get("/new", projectController.newProject);
router.post("/createProject", projectController.createProject);
router.get("/:id", projectController.getProject);
router.get("/:id/edit", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.render("projects/edit", { project });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

module.exports = router;
