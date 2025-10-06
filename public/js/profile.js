let notifpushed = false;
let userId = null;
const socket = io(window.location.origin);
console.log("profile is loading");
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.querySelector(".modalWrapper");
  const addDocumentModal = document.getElementById("addDocumentModal");
  const span = document.getElementsByClassName("close")[0];
  const editProjectForm = document.getElementById("editProjectForm");
  let currentProjectId = null;
  //
  // socket.on("set-user", (userId) => {
  //         ; // Assign custom ID
  //         console.log(`User ID set: ${socket.userId}`);
  //     });

  socket.on("connect", async () => {
    // console.log("Client connect"),
    let userProfile = await getUserId();
    userId = `${userProfile}`;
    // console.log("userProfile", userProfile);
    if (!socket.joinedRoom) {
      // Use custom tracking property
      socket.emit("join-room", userId, userProfile);
      socket.joinedRoom = true; // Mark room as joined
      console.log(`User ${userId} joined room ${userId}`);
    }
  });
  //<----------------
  socket.on("notificationAlert", (data) => {
    // console.log("notificationAlert profile line 32");
    console.log("Received notificationAlert"); //:", data);

    let newMessage = `<li class="project-item">
            <div class="project-header">
              <span>Hi ${data.displayName}, Would you like to join the project ${data.projectName}
                    ?</span>
              <button class="btn btn-primary affirmativeButton notificationChoice" data-id="${data.noteID}">
                Yes </button>
              <button class="btn btn-primary negativeButton notificationChoice" data-id="${data.noteID}"> No
              </button>
              <div class="notification-actions">

              </div>
            </div>

          </li>`;
    if (document.getElementById("emptyList")) {
      document.getElementById("emptyList").remove();
    }
    let list = document.getElementById("noteList");
    list.insertAdjacentHTML("afterbegin", newMessage);
    let notiButton = this.getElementById("openNotiModalButton");
    let numberOfNotes = notiButton.innerText.split(" ")[0];
    notiButton.textContent = `${+numberOfNotes + 1} Notifications`;
  });
  socket.on("user-active", (data) => {
    // console.log("profile.js socket.on user-active line 53");
    const NotifyButton = document.getElementById("openNotiModalButton");
    // if (data.active) {
    //   console.log("profile.js socket.on user-active line 54");
    // }
  });
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

      const projectId = this.getAttribute("href")
        .split("/edit")[0]
        .split("project/")[1];
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
        document.getElementById("editStartDate").value =
          project.startDate.split("T")[0];
        document.getElementById("editEndDate").value =
          project.endDate.split("T")[0];
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
      const response = await fetch(
        `/profile/project/${currentProjectId}?_method=PUT`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

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
      // console.log("name profile.js line 166", formData.name);
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

const noteList = document
  .getElementById("noteList")
  .addEventListener("click", (event) => {
    if (event.target.closest(".notificationChoice")) {
      saveNotification(event.target.closest(".notificationChoice"));
    }
  });

/**
 * Handles user interaction with a notification button.
 * - If the button is affirmative, attempts to add the user to the project via /project/addUser.
 * - Marks the notification as aged via /project/ageNotification.
 * - Updates the notification count and UI by removing the processed item.
 * - If no notifications remain, displays a fallback message.
 */
async function saveNotification(button) {
  const notificationId = button.dataset.id;

  try {
    if (button.classList.contains("affirmativeButton")) {
      console.log("trying to save the user to the project");
      let newUser = await fetch(`/project/addUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      }); // Handle server response
      const responseData = await newUser.json();
      if (newUser.ok) {
        console.log("User added successfully:", responseData);
      } else {
        console.error("Error adding user:", responseData);
      }
    }
    let ageNotification = await fetch(`/project/ageNotification`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationId }),
    });

    let responseData = await ageNotification.json();
    let notificationList = JSON.parse(responseData);
    let notiButton = document.getElementById("openNotiModalButton");

    notiButton.textContent = `${notificationList.length} Notifications`;
    button.closest("li").remove();
    let noteList = document.getElementById("noteList");
    if (noteList.children.length === 0) {
      const emptyList = document.createElement("li");
      emptyList.id = "emptyList";
      emptyList.innerText = "No notifications found";
      noteList.appendChild(emptyList);
    }
  } catch (error) {
    console.error(error, "User not found");
  }
}

async function getUserId() {
  const response = await fetch("/profile/getId");
  const userId = await response.json();
  return userId;
}
