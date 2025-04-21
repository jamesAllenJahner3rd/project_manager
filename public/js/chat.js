let currentProject = null;
 const url = window.location.href;
 
let currentProjectId = url.split('/project/')[1];
console.log(currentProjectId);
(async function getProjectInfo(){
    try{
        const response = await fetch ('/project/getProjectInfo');
        currentProject = await response.json()
        console.log( "inside",currentProject);


    }catch(err){
    console.log(err,"ERROR chat.js line 13 ")}

})()

console.log("after",currentProject);

const messageInput = document.getElementById("message-input");
const chatform = document.getElementById("chatForm");
const socket = io('http://localhost:3000')
const room = `chat`//${currentProject._id}`;
 console.log(`currentProject: ${currentProject}`);
// const project = JSON.parse('<%- JSON.stringify(project) %>');
// console.log(project);
// console.log({"columns":[],"_id":"67a1b983250ece3eb3b2e11f","name":"another","description":"testtest"  });
const roomName =currentProject.name


console.log("roomName", roomName, "room", room)
socket.on('connect', () => {

    displayMessage(`Client side: You connected with id: ${roomName}`);
    console.log(`Client side: User connected ${roomName}`);
});
document.addEventListener("DOMContentLoaded", () => {
    const getProject = param.id
    console.log('join-room', roomName, room);
    socket.emit('join-room', roomName, room);
});
socket.on('receive-message', message => displayMessage(message));
chatForm.addEventListener("submit", e => {
    e.preventDefault();
    const message = messageInput.value;

    if (message === "") return
    displayMessage(message)
    socket.emit('send-message', message, room)//server  socket.on('send-message',...
    messageInput.value = ""
})
// joinRoomButtom.addEventListener("click", () =>{
//     const room =roomInput.value
// })
function displayMessage(message) {
    console.log(message)
    const div = document.createElement("div")
    div.textContent = message
    console.log(div)
    document.getElementById("message-container").append(div)
}
