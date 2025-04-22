console.log("projectTemplate script is loaded");

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("editModal");
  const addDocumentModal = document.getElementById("addDocumentModal");
  const span = document.getElementsByClassName("close")[0];
  const editProjectForm = document.getElementById("editProjectForm");
  let currentProjectId = null;
  let addUserbutton = document.getElementById("addUserModalTrigger");
  addUserbutton.addEventListener("click", showaddUserModal);
  function showaddUserModal() {
    editModal.style.display = "block";
  }
});
