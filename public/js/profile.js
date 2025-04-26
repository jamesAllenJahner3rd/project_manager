let notifpushed = false;
console.log("profile is loading");
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.querySelector(".modalWrapper");
  const addDocumentModal = document.getElementById("addDocumentModal");
  const span = document.getElementsByClassName("close")[0];
  const editProjectForm = document.getElementById("editProjectForm");
  let currentProjectId = null;

  // Delete project functionality
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async function (event) {
      event.stopPropagation();

      if (confirm("Are you sure you want to delete this project?")) {
        const projectId = this.getAttribute("data-id");
        try {
          const response = await fetch(`/profile/project/${projectId}/delete`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (data.success) {
            this.closest(".project-item").remove();
          } else {
            alert("Failed to delete project");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Failed to delete project");
        }
      }
    });
  });

  // Edit project functionality
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", async function (event) {
      event.preventDefault();
      event.stopPropagation();

      const projectId = this.getAttribute("href").split("/edit")[0].split("project/")[1];
      currentProjectId = projectId;

      try {
        // Fetch project data
        const response = await fetch(`/profile/project/${projectId}/data`);
        if (!response.ok) throw new Error("Failed to fetch project data");

        const project = await response.json();
        console.log("Fetched project data:", project);

        // Populate form
        document.getElementById("editName").value = project.name;
        document.getElementById("editDescription").value = project.description;
        document.getElementById("editStartDate").value = project.startDate.split("T")[0];
        document.getElementById("editEndDate").value = project.endDate.split("T")[0];
        document.getElementById("editStatus").value = project.status;

        // Show modal
        modal.style.display = "block";
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to load project data");
      }
    });
  });

  // Close modal when clicking (x)
  span.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
    if (event.target === addDocumentModal) {
      addDocumentModal.style.display = "none";
      // Clear form fields
      document.getElementById("documentTitle").value = "";
      document.getElementById("documentContent").value = "";
    }
  });

  // Close modal when pressing Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (modal.style.display === "block") {
        modal.style.display = "none";
      }
    }
  });

  // Close button functionality
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      modal.style.display = "none";
    });
  });

  // Handle form submission
  editProjectForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = {
      name: document.getElementById("editName").value,
      description: document.getElementById("editDescription").value,
      startDate: document.getElementById("editStartDate").value,
      endDate: document.getElementById("editEndDate").value,
      status: document.getElementById("editStatus").value,
    };

    try {
      const response = await fetch(`/profile/project/${currentProjectId}?_method=PUT`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to update project");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update project");
    }
  });

  let currentColumnId = null;

  function showAddDocumentModal(projectId) {
    currentColumnId = projectId;
    const modal = document.getElementById("addDocumentModal");
    modal.style.display = "block";
  }

  // In your form submission handler
  document
    .querySelector('form[action="/project/createProject"]')
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        status: document.getElementById("status").value,
        columns: [], // Initialize empty columns array
      };
      console.log("name profile.js line 166", formData.name);
      try {
        const response = await fetch("/project/createProject", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  // In your form submission handler
});
const decisionButton = document.querySelectorAll(".notificationChoice");
decisionButton.forEach((button) => {
  button.addEventListener("click", saveNotification);
});
async function saveNotification(event) {
  const notificationId = event.target.dataset.id;
  console.log(
    "notificationId profile.js save Notification line 195",
    notificationId
  );
  console.log(event.currentTarget.classList, event.currentTarget, event.target);

  console.log(`${notificationId} profile.js line 192`);
  try {
    if (event.target.classList.contains("affirmativeButton")) {
      console.log("trying to save the user to the project");
      let newUser = await fetch(`/project/addUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // body{ event.target}
        },
        body: JSON.stringify({ notificationId }),
      }); // Handle server response
      const responseData = await newUser.json();
      console.log(responseData);
      if (newUser.ok) {
        console.log("User added successfully:", responseData);
      } else {
        console.error("Error adding user:", responseData);
      }
    }
    //console.log(
      "notificationId profile.js save Notification line 219",
      notificationId
    );
    let ageNotification = await fetch(`/project/ageNotification`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationId }),
    });
    let responseData = await ageNotification.json();
    //console.log(responseData.length, responseData[0], responseData[625]);

    let notificationList = JSON.parse(responseData);

    let notiButton = document.getElementById("openNotiModalButton");

    notiButton.textContent = `${notificationList.length} Notifications`;
    //console.log("test1", JSON.parse(responseData));
    event.target.closest("li").remove();
  } catch (error) {
    console.error(error, "User not found");
  }
}