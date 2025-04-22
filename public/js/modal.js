 console.log("Modal.js loaded")
 //Functions to handle general modal behavior
 const modal = document.getElementById("editModal");
const span = document.getElementsByClassName('close')[0];
let openedModal = null;
function openModal(event){
  openedModal = event.target;
  let toggledElement = event.target.nextElementSibling;
  let theForm =toggledElement.firstElementChild;
  toggledElement.addEventListener("click", function (event) {
    console.log('click')
    if (!theForm.contains(event.target)) {
      toggledElement.style.display ='none'
    }
  })
    if(  toggledElement.style.display === 'block'){
      toggledElement.style.display = 'none';
    }else{
      toggledElement.style.display = 'block';
    }
}
span.onclick = function () {
        modal.style.display = 'none';
}
//Create project modal specific
const openCPbutton = document.getElementById('openCPModalButton');
openCPbutton?.addEventListener('click', openModal)

//Notification modal specific
const Notificationbutton = document.getElementById('openNotiModalButton');
Notificationbutton?.addEventListener('click', openModal)

//Add User modal specific
const openAddUserbutton = document.getElementById('addUserModalTrigger');
openAddUserbutton?.addEventListener('click', openModal)
