import { currentProject } from '/js/profile.js';
console.log("addUserModal.js is loaded");

const addUserWindow = document.querySelector("#addUserForm");
console.log("addUserModal.js,line 5", currentProject);
addUserWindow.addEventListener("submit", async function (event) {
  event.preventDefault();

  let requestedUserName = document.getElementById("userName").value;
  let userType = document.getElementById("UserORAdmin").value;
  // let currentProject = JSON.parse("<%- project %>");
  let sender = currentProject.adminId;
  let senderName = currentProject.userId;
  let projectId = currentProject._id;
  let projectName = currentProject.name;
  console.log( "requestedUserName",requestedUserName, 'userType',userType, "currentProject",currentProject, "sender",sender, 'projectId',projectId, "projectName",projectName)
  // {"_id":"67f572c6ef1aa80c4fac9e3c",------------------
  // "name":"test multiple admin",------------------------

  // "description":"k",
  // "startDate":"2025-04-08T00:00:00.000Z",
  // "endDate":"2025-04-08T00:00:00.000Z",
  // "status":"Not Started",
  // "userId":["67f5dafa71fb05916f7085ae"],
  // "adminId":["67f6b4ca60699ef315f67c26"],-----------------------
  // "createdAt":"2025-04-08T19:02:30.837Z","__v":0}
  try {
    console.log('error? fetch addUserModal?')
    let requestedUserId = await fetch("/profile/notifyUser", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestedUserName,
        userType,
        currentProject,
        sender,
        senderName,
        projectId,
        projectName,
      }),
    });
    const responseData = await requestedUserId.json();
    console.log(responseData)
    // displayMessage(responseData.message);
  } catch (error) {
    console.error(error, "requestedUserId not found,profile.ejs line 78");
  }
});
