console.log("Modal.js loaded");
//Functions to handle general modal behavior
// const modal = document.querySelectorAll("div:has(>.modal-content)");
// const spanList =document.querySelectorAll(".close")

// let openedModal = null;
function openModal(event) {
  let target = event.target;
  let currenttarget = event.currentTarget;

  const openedModal = event.target;
  let toggledElement = openedModal.nextElementSibling;
  const span = toggledElement.querySelector(".close");

  let theForm = toggledElement?.firstElementChild || null; //fixed an error before the element loads.
  toggledElement.addEventListener("click", function (event) {
    // console.log("click modal.js line 11");
    if (!theForm.contains(event.target)) {
      toggledElement.style.display = "none";
    }
  });
  if (toggledElement.style.display === "block") {
    toggledElement.style.display = "none";
  } else {
    toggledElement.style.display = "block";
  }

  if (span) {
    span.addEventListener("click", function () {
      toggledElement.style.display = "none";
    });
  }
}
//Create project modal specific
const openCPbutton = document.getElementById("openCPModalButton");
openCPbutton?.addEventListener("click", openModal);

//Create column modal specific
const openCCbutton = document.getElementById("openCreateColumnModalButton");
openCCbutton?.addEventListener("click", openModal);

//Notification modal specific
const Notificationbutton = document.getElementById("openNotiModalButton");
Notificationbutton?.addEventListener("click", openModal);

//Add User modal specific
const openAddUserbutton = document.getElementById("addUserModalTrigger");
openAddUserbutton?.addEventListener("click", openModal);

//Add Filter modal specific
const openFilterDocumentbutton = document.getElementById(
  "filterDocumentModalButton"
);
openFilterDocumentbutton?.addEventListener("click", openModal);
filterDocumentModalButton;
