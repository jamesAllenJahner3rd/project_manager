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
const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("Socket connected");

  // Request project info via socket.io
  socket.emit("get-project-info", currentProjectId);

  // Listen for the project info response
  socket.on("project-info", async (project) => {
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
      const profileId = await getUserId();
      socket.emit("join-room", `chat${currentProject._id}`, profileId);
      socket.joinedRoom = true; // Mark room as joined
      console.log(profileId, "joinedRoom: ", `chat${currentProject._id}`);
      displayMessage(`You connected with room: ${roomName}`);
    }
  });
});
async function getUserId() {
  const response = await fetch("/profile/getId");
  const userId = await response.json();
  return userId;
}
// Handle incoming messages
socket.on("receive-message", (message) => displayMessage(message));

// Handle form submission for sending messages
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;

  if (message === "") return;
  socket.emit("send-message", message, `chat${currentProjectId}`);
  messageInput.value = "";
});

async function displayMessage(message) {
  const response = await fetch("/profile/getDisplayName");
  const displayName = await response.json();
  const newMessage = document.createElement("div");
  newMessage.textContent = `${displayName}: ${message}`;
  const chatContainer = document.getElementById("message-container");
  chatContainer.append(newMessage);
  chatContainer.scroll(0, chatContainer.scrollHeight);
  //chatContainer.scrollTop = chatContainer.scrollHeight;
}
export { currentProject };
