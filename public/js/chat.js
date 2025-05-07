let currentProject = null;
const currentUrl = window.location.href;

let currentProjectId = currentUrl.split("/project/")[1]?.split("?")[0];
if (!currentProjectId) {
  console.error("Project ID not found in URL");
}
console.log(currentProjectId);
console.log("Fetching project info for ID:", currentProjectId);

const messageInput = document.getElementById("message-input");
const chatform = document.getElementById("chatForm");
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Socket connected");

  // Request project info via socket.io
  socket.emit("get-project-info", currentProjectId);

  // Listen for the project info response
  socket.on("project-info", (project) => {
    if (!project || !project.name) {
      console.error("Invalid project data received");
      return;
    }
    //the if statement was add to stop repeated joining the room.
    if (!currentProject) {
      currentProject = project;
      console.log("Project info received:", currentProject);
    }

    // Set roomName dynamically
    const roomName = currentProject.name;
    console.log("roomName", roomName);

    // Join the room after receiving project info
    if (!socket.joinedRoom) {
      socket.emit("join-room", roomName, `chat${currentProject._id}`);
      socket.joinedRoom = true; // Mark room as joined
      displayMessage(`You connected with room: ${roomName}`);
    }
  });
});

// Handle incoming messages
socket.on("receive-message", (message) => displayMessage(message));

// Handle form submission for sending messages
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;

  if (message === "") return;
  displayMessage(message);
  socket.emit("send-message", message, `chat${currentProject._id}`);
  messageInput.value = "";
});

async function displayMessage(message) {
  const response = await fetch("/profile/getId");
  const userProfile = await response.json();
  // console.log("USERPROFILE:", userProfile);
  // console.log(`${userProfile.displayName}: ${message}`);
  const newMessage = document.createElement("div");
  newMessage.textContent = `${userProfile.displayName}: ${message}`;
  const chatContainer = document.getElementById("message-container")
  chatContainer.append(newMessage);
  chatContainer.scroll(0,chatContainer.scrollHeight)
  //chatContainer.scrollTop = chatContainer.scrollHeight;
}
export { currentProject };
