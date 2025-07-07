console.log("kanban.js has loaded");
document.addEventListener("DOMContentLoaded", () => {
  init();
});
let currentProject = null;
const currentUrl = window.location.href;

let currentProjectId = currentUrl.split("kanban")[1]?.split("?")[0];
if (!currentProjectId) {
  console.error("Project ID not found in URL");
}
let columnDrake;
let documentDrake;
let listOfColumn = [];
const projectId = currentProjectId;

const socket = io(window.location.origin);
let room = async () => {
  try {
    let res = await fetch(`/profile/project/${projectId}/data`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    console.log("end of room");
    return await res.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
};
const roomName = room.name; //**************************
console.log("roomName:", roomName);

let STATUS_BY_POSITION = {};
function setStateList() {
  if (STATUS_BY_POSITION == undefined) {
    let STATUS_BY_POSITION = {};
  }
  listOfColumn = Array.from(document.querySelectorAll("div ul.dragColumn"));
  listOfColumn.forEach((column, index) => {
    // Add column index for status tracking
    column.index = index;
    listOfColumn[index] = column;
    STATUS_BY_POSITION[index] = column.innerText.split("\n")[0];
  });
  console.log("end of setStateList");
  return { STATUS_BY_POSITION, listOfColumn };
}

// async
function createStatusMap(projectId) {
  // try {
  //     const res = await fetch(`/project/kanban/${projectId}/data`);
  //     if (!res.ok) {
  //         throw new Error(`Fetch failed with status ${res.status}. kanban.js line 21`);
  //     }

  //     const kanbanData = await res.json();
  //     console.log("kanbanData",kanbanData)
  //     // Ensure kanbanData and columns exist before proceeding
  //     if (!kanbanData || !kanbanData.columns) {
  //         throw new Error("Kanban data is missing or incorrectly formatted.");
  //     }

  // for (let i = 0; i < listOfColumn.length; i++) {

  //   STATUS_BY_POSITION[i] = listOfColumn[i].innerText;
  // }

  console.log("STATUS_BY_POSITION:", STATUS_BY_POSITION);
  return STATUS_BY_POSITION; // Return it for use elsewhere

  // } catch (err) {
  //     console.error("Error fetching or processing Kanban data:", err);
  //     return {}; // Return an empty object instead of null
  // }
  console.log("end of createStatusMap");
}
console.log("currentProject:", currentProject);

// const STATUS_BY_POSITION = {
//   0: "to_do", // To Do (leftmost column)
//   1: "in_progress", // In Progress
//   2: "testing", // Testing
//   3: "done", // Done (rightmost column)
// };
// Get next status in progression
function getNextStatus(currentStatus) {
  //if (STATUS_BY_POSITION == undefined) {
    ({ STATUS_BY_POSITION, listOfColumn } = setStateList())
  //}
  let key = Object.keys(STATUS_BY_POSITION).find(
    (i) => STATUS_BY_POSITION[i] === currentStatus
  );
  const nextColumnTitle = STATUS_BY_POSITION[+key + 1]||currentStatus;
  const nextColumn = listOfColumn.find(
    (ul) =>
      ul.querySelector("h1.title")?.textContent.trim() === `${nextColumnTitle}`
  );
  //querySelector(`ul:has( nav h1[title=${STATUS_BY_POSITION[+key + 1]}])`);
  const documentNumber = nextColumn.querySelectorAll(".dragDocument").length;
  const maxDocumentCount = nextColumn
    .querySelector("span.max-documents")
    .textContent.split(" ")[1];
  console.log("end of getNextStatus", documentNumber, maxDocumentCount);
  if (documentNumber < maxDocumentCount || isNaN(maxDocumentCount)) {
    return STATUS_BY_POSITION[+key + 1]; // Don't allow loopback
  } else {
    alert("Max document limit reached");
    return STATUS_BY_POSITION[+key]; // loopback
  }
}

// Get status based on column position
function getStatusForColumn(columnIndex) {
  console.log("kanban columnIndex line 81", columnIndex);
  console.log(
    "kanban columnIndex line 81",
    STATUS_BY_POSITION,
    ` ${STATUS_BY_POSITION}`
  );
  console.log(
    "end of getStatusForColumn",
    "STATUS_BY_POSITION",
    STATUS_BY_POSITION,
    "list of columns",
    listOfColumn
  );

  return STATUS_BY_POSITION[columnIndex];
}

// Handle progress click
async function handleProgressClick(documentId, currentStatus) {
  try {
    let { STATUS_BY_POSITION, listOfColumn } = setStateList();
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus === currentStatus) return; // No change needed
    const nextColumn = listOfColumn.find(
      (column) =>
        column.querySelector("h1.title").textContent.trim() === `${nextStatus}`
    );
    const maxDocuments = nextColumn
      .querySelector(`.max-documents`)
      .textContent.split(" ")[1];
    const currentDocuments = nextColumn
      .querySelector(`.document-count`)
      .textContent.split(" ")[1];
    if (+maxDocuments <= +currentDocuments) {
      alert("Max document limit reached");
      return;
    }
    // Find document and its current column
    const doc = document.getElementById(documentId);
    if (!doc) return;

    const currentColumn = doc.closest(".dragColumn");
    if (!currentColumn) return;
    console.log(
      `Moving document ${documentId} from ${currentStatus} → ${nextStatus}`
    ); //*****************************************
    // Find column index of target status
    let targetColumnIndex = -1;
    for (const [index, status] of Object.entries(STATUS_BY_POSITION)) {
      if (status === nextStatus) {
        targetColumnIndex = parseInt(index);
        break;
      }
    }

    if (targetColumnIndex === -1) return;

    // Get all columns and find target column
    const columns = Array.from(document.querySelectorAll(".dragColumn"));
    listOfColumn = columns;
    if (targetColumnIndex >= columns.length) return;

    const targetColumn = columns[targetColumnIndex];
    const targetContainer = targetColumn.querySelector(".documents-container");

    // Remove from current column and append to target column
    if (doc.parentNode) {
      doc.parentNode.removeChild(doc);
    } else {
      console.warn("Document parent node not found.");
    }
    targetContainer.appendChild(doc);

    // Update document status data attribute
    doc.dataset.status = nextStatus;

    // Update the progress button appearance
    const progressBtn = doc.querySelector(".progress-button");

    if (progressBtn) {
      updateProgressButtonState(progressBtn, nextStatus);
    }

    // Update document counts
    updateDocumentCount(currentColumn);
    updateDocumentCount(targetColumn);

    // Save changes
    saveToLocalStorage();
    console.log(" end of handleProgressClick");
    if (STATUS_BY_POSITION == undefined) {
      let { STATUS_BY_POSITION, listOfColumn } = setStateList();
    }
  } catch (error) {
    console.error("Error updating document status:", error);
    // Use existing error handling - no custom error states
  }
}

// Update progress button appearance based on status
function updateProgressButtonState(button, status) {
  // Clear any existing classes
  button.className = "progress-button";
  button.title = `Status: ${status}`;
  button.textContent = "✓"; //'&#10003'

  // switch (status) {
  //   case "to_do":
  //     button.textContent = "";
  //     break;
  //   case "in_progress":
  //     button.textContent = "⏳";
  //     break;
  //   case "testing":
  //     button.textContent = "🧪";
  //     break;
  //   case "done":
  //     button.textContent = "✓";
  //     break;
  //   default:
  // button.textContent = "";
  // }
  console.log("end of updateProgressButtonState");
}

socket.on("board-updated", (updatedBoard) => {
  console.log("kanban.js line 139 Received board update:", updatedBoard);
  console.log("kanban.js line 142 Current project ID:", projectId);
  if (!updatedBoard) {
    console.warn("Updated board data is undefined!kanban.js line 142");
    return;
  }
  if (updatedBoard.projectId !== projectId) {
    console.warn("Received update for a different project! kanban.js line 146");
    return;
  }
  loadFromLocalStorage(updatedBoard, true);
});

async function loadFromLocalStorage(emittedBoard, emitted) {
  const kanban = await room();
  if (!kanban || typeof kanban !== "object") {
    console.error("Kanban data is not in an expected object format:", kanban);
  }
  console.log(
    "loadFromLocalStorage kanbna.js line 138 kanban",
    kanban,
    "parse"
  );
  //JSON.parse(room))
  const savedState = localStorage.getItem(`kanbanBoard-${projectId}`);

  let boardState;

  if (emittedBoard) {
    boardState = emittedBoard;
  } else if (savedState) {
    boardState = JSON.parse(savedState);
  } else if (kanban && kanban.length > 0) {
    boardState = kanban[0];
  } else {
    boardState = {
      projectId: projectId,
      columns: [],
    };
  }

  if (boardState.projectId !== projectId) {
    console.log("No saved state for this project");
    return;
  }

  const dragparent = document.getElementById("dragparent");
  dragparent.innerHTML = "";
  listOfColumn = [];

   listOfColumn =await Promise.all( 
    boardState.columns.map(async (column, index) => {
    // Add column index for status tracking
    column.index = index;
    const newColumn = await createColumnFromSaved(column);
    dragparent.appendChild(newColumn);
    STATUS_BY_POSITION[index] = column.title;
    return newColumn;
  }))
  reinitializeDragula(dragparent, listOfColumn);
  console.log("end of loadFromLocalStorage");
}

function saveToLocalStorage() {
  const boardState = {
    projectId: projectId,
    columns: Array.from(document.querySelectorAll("div ul.dragColumn")).map(
      (column, columnIndex) => {
        const documents = Array.from(
          column.querySelectorAll(".dragDocument")
        ).map((doc) => {
          // Get status based on column position
          const status = getStatusForColumn(columnIndex);
          let labels = doc.querySelector(".labelsList").textContent
          console.log("labels:", labels)
          return {
            id: doc.id,
            title: doc.querySelector("h2").textContent,
            description: doc.querySelector("p").textContent,
            backgroundColor: doc.style.backgroundColor || "#08CF65",
            status: status,
            assignee:
              doc.querySelector(".assignedTo").textContent || "Unassigned",
            labels: Array.from(
              doc.querySelector(".labelsList").textContent.split(" ")
            ),
          };
        });

        return {
          id: column.id,
          title: column.querySelector(".title").textContent,
          backgroundColor: column.style.backgroundColor || "#f9f9f9",
          documents: documents,
          maxDocuments: column
            .querySelector("span.max-documents")
            .textContent.split(" ")[1],
          canAddDocuments: column.querySelector('.canAddDocuments')? true : false,
          canChangeDocumentColor: column.querySelector('.canChangeDocumentColor')? true : false,
          canDeleteDocuments: column.querySelector('.canDeleteDocuments')? true : false,
        };
      }
    ),
  };

  // Update document counts
  document.querySelectorAll(".dragColumn").forEach((column) => {
    updateDocumentCount(column);
  });

  // Save to both localStorage and server
  localStorage.setItem(`kanbanBoard-${projectId}`, JSON.stringify(boardState));

  // Emit to server with error handling
  try {
    socket.emit("updateBoard", boardState, (response) => {
      console.log("Server response:", response);
    });
  } catch (error) {
    console.error("Error saving to server:", error);
  }
  console.log(
    "end of saveToLocalStorage",
    "STATUS_BY_POSITION",
    STATUS_BY_POSITION,
    "list of columns",
    listOfColumn
  );
}

function createDocumentFromSaved(doc, columnIndex = 0) {
  const documentLineItem = document.createElement("li");
  documentLineItem.className = "dragDocument";
  documentLineItem.id = doc.id;
  documentLineItem.style.backgroundColor = doc.backgroundColor;

  // Set document status or default based on column
  const status = doc.status ?? getStatusForColumn(columnIndex);
  documentLineItem.dataset.status = status;

  const docContainer = document.createElement("div");
  docContainer.className = "document-container";

  // Add title and description in a content container
  const contentContainer = document.createElement("div");
  contentContainer.className = "document-content-container";
  contentContainer.style.width = "100%";
  contentContainer.style.boxSizing = "border-box";
  contentContainer.style.overflow = "hidden"; // Prevent text from overflowing

  const docHeader = document.createElement("div");
  // Add title
  const docTitle = document.createElement("h2");
  docTitle.textContent = doc.title;
  docTitle.style.fontWeight = "bold";
  docTitle.style.wordWrap = "break-word"; // Allow long words to break
  docTitle.addEventListener("dblclick", () => edit(docTitle));
  docHeader.appendChild(docTitle);
const iconContainer = document.createElement("div");

  iconContainer.className = "document-icons";
  iconContainer.style.position = "absolute";
  iconContainer.style.right = "8px";
  iconContainer.style.top = "8px";
  iconContainer.style.display = "flex";
  iconContainer.style.gap = "8px";
  iconContainer.style.alignItems = "center";
  iconContainer.style.justifyContent = "flex-end";
  iconContainer.style.width = "auto";
  iconContainer.style.zIndex = "5"; // Ensure icons are above text
  docHeader.appendChild(iconContainer);

  // Add color picker
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.className = "document-color-picker";
  colorPicker.value = doc.backgroundColor || "#08CF65";
  colorPicker.style.flexShrink = "0";
  colorPicker.addEventListener("input", (e) => {
    documentLineItem.style.backgroundColor = e.target.value;
    saveToLocalStorage();
  });
  iconContainer.appendChild(colorPicker);

  // Add progress button
  const progressBtn = document.createElement("button");
  progressBtn.className = "progress-button";
  progressBtn.style.width = "24px";
  progressBtn.style.height = "24px";
  progressBtn.style.border = "1px solid #ccc";
  progressBtn.style.borderRadius = "4px";
  progressBtn.style.cursor = "pointer";
  progressBtn.style.backgroundColor = "#ffffff";
  progressBtn.style.display = "flex";
  progressBtn.style.alignItems = "center";
  progressBtn.style.justifyContent = "center";
  progressBtn.style.flexShrink = "0";
  progressBtn.style.margin = "0";
  progressBtn.style.padding = "0";
  progressBtn.textContent = "✓";
  progressBtn.innerText = "✓";

  // Set initial state based on status
  updateProgressButtonState(progressBtn, status);

  progressBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    handleProgressClick(documentLineItem.id, documentLineItem.dataset.status);
  });
  iconContainer.appendChild(progressBtn);

  // Add delete button
  const deleteMe = document.createElement("button");
  deleteMe.className = "deleteButton";
  deleteMe.dataset.document = documentLineItem.id;
  deleteMe.style.position = "static";
  deleteMe.style.flexShrink = "0";
  deleteMe.style.margin = "0";
  deleteMe.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument(deleteMe.dataset.document);
    }
  });
  iconContainer.appendChild(deleteMe);

  docContainer.appendChild(docHeader);

  // Add description
  const docDescrTitle = document.createElement("h4");
  docDescrTitle.textContent = "Description:";
  const docDescription = document.createElement("p");
  docDescription.textContent = doc.description;
  docDescription.style.wordWrap = "break-word"; // Allow long words to break
  docDescription.addEventListener("dblclick", () => edit(docDescription));
  contentContainer.appendChild(docDescrTitle);
  contentContainer.appendChild(docDescription);

  docContainer.appendChild(contentContainer);
  // Add assignee
  const docAssigneeContainer = document.createElement("div");
  const docAssigneeTitle = document.createElement("h4");
  docAssigneeTitle.textContent = "Assignee:";
  const docAssignee = document.createElement("p");
  docAssignee.className = "assignedTo";
  docAssignee.textContent = `${doc.assignee || "Unassigned"}`;
  docAssigneeContainer.className = "document-assignee-container";
  docAssigneeContainer.style.display = "flex";
  docAssigneeContainer.style.alignItems = "Baseline";
  docAssigneeContainer.appendChild(docAssigneeTitle);
  docAssigneeContainer.appendChild(docAssignee);
  contentContainer.appendChild(docAssigneeContainer);
  
  // Add labels
  const docLabelsContainer = document.createElement("div");
  const docLabelsTitle = document.createElement("h4");
  docLabelsTitle.textContent = "Labels:";
  const docLabelsList = document.createElement("p");
  docLabelsList.className = "labelsList";
  docLabelsList.textContent = `${doc.labels.join(" ")}`;
  docLabelsList.addEventListener("dblclick", () => edit(docLabelsList));
  console.log (docLabelsList.textContent)
 
  // Create icon container div
   docLabelsContainer.appendChild(docLabelsTitle);
  docLabelsContainer.appendChild(docLabelsList);
  // docAssigneeContainer.children.forEach((child) => {console.log(child.textContent)});
  contentContainer.appendChild(docLabelsContainer);
  

  

  
  documentLineItem.appendChild(docContainer);
  console.log("end of createDocumentFromSaved");
  return documentLineItem;
}

async function createColumnFromSaved(column) {
  const currentUrl = window.location.href;
 const id = currentUrl.split("kanban")[1].split("?")[0]
 
  const  response = await fetch(`/project/kanban/${id}/isAdmin`);
 const isAdmin = await response.json()
  const newColumn = document.createElement("ul");
  newColumn.className = "dragColumn";
  newColumn.id = column.id;
  newColumn.style.backgroundColor = column.backgroundColor;

  // Store column index as data attribute for status mapping
  newColumn.dataset.index = column.index || 0;

  const columnNav = document.createElement("nav");
  columnNav.className = "columnNav";

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  // Add document button
  const newDocPopup = document.createElement("button");
  newDocPopup.className = "newDocPopupButton";
  newDocPopup.dataset.column = newColumn.id;
  newDocPopup.addEventListener("click", () =>
    createDocumentPopup(newDocPopup.dataset.column)
  );
  buttonContainer.appendChild(newDocPopup);

  // Add color picker
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.className = "column-color-picker";
  colorPicker.value = column.backgroundColor || "#f9f9f9";
  colorPicker.addEventListener("input", (e) => {
    newColumn.style.backgroundColor = e.target.value;
    saveToLocalStorage();
  });
  buttonContainer.appendChild(colorPicker);

  // Add delete button
  const deleteMe = document.createElement("button");
  deleteMe.className = "deleteButton";
  deleteMe.dataset.column = newColumn.id;
  deleteMe.addEventListener("click", () =>
    deleteDocument(deleteMe.dataset.column)
  );
  buttonContainer.appendChild(deleteMe);

  columnNav.appendChild(buttonContainer);

  // Add title
  const title = document.createElement("h1");
  title.className = "title";
  title.textContent = column.title;
  title.addEventListener("dblclick", () => edit(title));
  columnNav.appendChild(title);

  newColumn.appendChild(columnNav);

  // Create documents container
  const documentsContainer = document.createElement("div");
  documentsContainer.className = "documents-container";
  newColumn.appendChild(documentsContainer);

  // Add documents to the container
  if (!column.documents || column.documents.length === 0) {
    console.warn(`No documents found for column: ${column.title}`);
  } else {
    column.documents.forEach((document) => {
      const newDocument = createDocumentFromSaved(document, column.index);
      documentsContainer.appendChild(newDocument);
    });
  }

  // Add column footer with document count
  const columnFooter = document.createElement("div");
  columnFooter.className = "column-footer";

  const documentCount = document.createElement("span");
  documentCount.className = "document-count";
  documentCount.textContent = `Documents: ${column.documents.length}`;
  columnFooter.appendChild(documentCount);
  const maxDocumentCount = document.createElement("span");
  maxDocumentCount.className = "max-document-count";
  let maxTextContent = () => {
    if (column.maxDocuments === 0) {
      return "None";
    } else {
      return column.maxDocuments;
    }
  };
  maxDocumentCount.classList.add("max-documents");
  maxDocumentCount.textContent = `Max: ${maxTextContent()}`;
  newColumn.appendChild(columnFooter);
  columnFooter.appendChild(maxDocumentCount);
  console.log("end of createColumnFromSaved");
  return newColumn;
}

function updateDocumentCount(column) {
  const documentCount = column.querySelector(".document-count");
  if (documentCount) {
    const count = column.querySelectorAll(".dragDocument").length;
    documentCount.textContent = `Documents: ${count}`;
  }
  console.log("end of updateDocumentCount");
}

function reinitializeDragula(dragparent, listOfColumn) {
  if (columnDrake) columnDrake.destroy();

  columnDrake = dragula([dragparent], {
    moves: (el, container, handle) =>
      el.classList.contains("dragColumn") &&
      (handle.tagName === "NAV" || handle.parentElement.tagName === "NAV"),
    accepts: (el, target) =>
      el.classList.contains("dragColumn") && target === dragparent,
    direction: "horizontal",
  });

  if (documentDrake) documentDrake.destroy();

  // Update to use document containers
  const documentContainers = listOfColumn
    .map((column) => column.querySelector(".documents-container"))
    .filter((container) => container !== null);

  documentDrake = dragula(documentContainers, {
    moves: (el, container, handle) => el.classList.contains("dragDocument"),
    accepts: (el, target) => {
      let isAcolumn = target.classList.contains("documents-container");
      let currentDocuments = target.children.length;
      let maxDocuments = target.nextElementSibling
        .querySelector(".max-documents")
        .textContent.split(" ")[1];
      if (maxDocuments === "∞") {
        maxDocuments = currentDocuments + 1;
      }
      return isAcolumn && currentDocuments < +maxDocuments;
    },
  });

  columnDrake.on("drop", (el, target, source) => {
    if (source && source !== target) {
      source.removeChild(el);
    }

    // Update column indices after reordering
    listOfColumn = Array.from(document.querySelectorAll("div ul.dragColumn"));
    listOfColumn.forEach((column, index) => {
      column.dataset.index = index;
      STATUS_BY_POSITION[index] = column.innerText.split("\n")[0];
    });

    saveToLocalStorage();
    console.log("end of List of column, drop");
  });

  documentDrake.on("drop", (el, target, source) => {
    // Update document counts for both source and target columns
    if (source && target) {
      const sourceColumn = source.closest(".dragColumn");
      const targetColumn = target.closest(".dragColumn");

      if (sourceColumn) {
        updateDocumentCount(sourceColumn);
      }

      if (targetColumn && targetColumn !== sourceColumn) {
        updateDocumentCount(targetColumn);

        // Update document status based on new column
        const targetColumnIndex = parseInt(targetColumn.dataset.index || 0);
        const newStatus = getStatusForColumn(targetColumnIndex);

        // Update document status
        el.dataset.status = newStatus;

        // Update progress button appearance
        const progressBtn = el.querySelector(".progress-button");
        if (progressBtn) {
          updateProgressButtonState(progressBtn, newStatus);
        }
      }
    }

    saveToLocalStorage();
    console.log("end of documentDrake");
  });
  console.log("end of reinitializeDragula");
}

function deleteDocument(docID) {
  const theDoomedDocument = document.getElementById(docID);
  if (!theDoomedDocument) {
    console.warn(
      `Document ${docID} not found for deletion. kanban.js line 509`
    );
    return;
  }
  if (theDoomedDocument) {
    theDoomedDocument.parentNode.removeChild(theDoomedDocument);
    saveToLocalStorage();
  }
  console.log("end of deleteDocument end");
}

function edit(element) {
  let text = element.textContent;
  element.textContent = "";
  const rewrite = document.createElement("input");
  rewrite.classList.add("form-control");
  rewrite.id = "editInput";
  rewrite.type = "textbox";
  rewrite.placeholder = text;
  rewrite.value = text;

  rewrite.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      element.textContent = rewrite.value || rewrite.placeholder;
      rewrite.remove();
      saveToLocalStorage();
    } else if (event.key === "Escape") {
      element.textContent = text;
      rewrite.remove();
    }
  });

  rewrite.addEventListener("blur", function () {
    element.textContent = text;
    rewrite.remove();
  });

  element.appendChild(rewrite);
  rewrite.focus();
  console.log("end of edit");
}

function createDocumentPopup(columnData) {
  const maxDocuments = document
    .getElementById(`${columnData}`)
    .querySelector(`.max-documents`)
    .textContent.split(" ")[1];
  const currentDocuments = document
    .getElementById(`${columnData}`)
    .querySelector(`.document-count`)
    .textContent.split(" ")[1];
  if (+maxDocuments <= +currentDocuments) {
    alert("Max document limit reached");
    return;
  }

  const theDocPopupForm = document.getElementById("createDocumentForm");
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  document.body.appendChild(backdrop);
  backdrop.style.display = "block";
  theDocPopupForm.style.display = "block";
  document.body.classList.add("modal-open");

  // const assigneeButton = document.getElementById("documentAssignee")
  // assigneeButton
  // adminList()

  const popupButton = document.getElementById("createDoc");
  popupButton.setAttribute("data-id", columnData);
  const documentTitle = document.getElementById("documentTitle");
  documentTitle.focus();
  console.log("end of createDocumentPopup");
}
// async function adminList(){
//   console.log("adminList started");
//   try{
//     const res  = await fetch(`/project/kanban/${projectId}/assignee`);
//     if(!res.ok){
//       throw new Error(`HTTP Error: ${res.status}`);
//     }
//     const listOfAdmin = await res.json();
//     console.log("listOfAdmin:", listOfAdmin);
//     const assigneeButton = document.getElementById("documentAssignee")
//     const assigneeList = document.createElement("select");
//     listOfAdmin.forEach((profile,i)=>{
//       const option = document.createElement("option");
//       option.value = profile._id;
//       option.textContent = profile.displayName;
//       assigneeButton.appendChild(option)
//     })
//     assigneeButton.addEventListener("change", (event) => {
//     assigneeButton.value = "Assignee: " + event.target.displayName;
//     })

//   //something
//   }catch(error){
//     console.error("Fetch failed:", error);
//   }finally{
//     console.log("end of adminList");
//   }
// }
function init(emittedBoard = null, emitted = false) {
  const createColumnForm = document.getElementById("createColumnForm");
  const createDocumentForm = document.getElementById("createDocumentForm");
  const dragparent = document.getElementById("dragparent");

  console.log("init started");

  // Load saved data first
  loadFromLocalStorage(emittedBoard, emitted);
  reinitializeDragula(dragparent, listOfColumn);

  // Handle the drop event for columns
  columnDrake.on("drop", (el, target, source) => {
    if (source && source !== target) {
      source.removeChild(el); // Remove the original column from the source
    }

    // Update column indices after reordering
    const columns = Array.from(document.querySelectorAll(".dragColumn"));
    columns.forEach((column, index) => {
      column.dataset.index = index;
    });

    saveToLocalStorage();
  });

  // Update listOfColumn
  listOfColumn = Array.from(document.querySelectorAll(".dragColumn"));
  console.log(listOfColumn);

  // Handle the drop event for documents
  documentDrake.on("drop", saveToLocalStorage);

  createColumnForm.removeEventListener("submit", handleColumnSubmit);
  createColumnForm.addEventListener("submit", handleColumnSubmit);
  async function handleColumnSubmit(event) {
    event.preventDefault();
    const columnContent = document.getElementById("columnContent").value;
    const maxDocuments = document.getElementById("maxDocuments").value || "∞";
    const column = {
      id: `column-${Date.now()}`,
      title: columnContent,
      backgroundColor: "#f9f9f9",
      documents: [],
      index: listOfColumn.length,
      maxDocuments,
    };
    const newColumn = await createColumnFromSaved(column);
    dragparent.appendChild(newColumn);
    listOfColumn.push(newColumn);
    const modal = document.querySelector(".modalWrapper");
    modal.style.display = "none";
    createColumnForm.reset();
    saveToLocalStorage();
    // createStatusMap(projectId);

    // Reinitialize dragula for documents with new column
    documentDrake.destroy();
    listOfColumn = Array.from(document.querySelectorAll(".dragColumn"));

    // Update to use document containers consistently
    const documentContainers = listOfColumn
      .map((column) => column.querySelector(".documents-container"))
      .filter((container) => container !== null);

    documentDrake = dragula(documentContainers, {
      moves: (el, container, handle) => el.classList.contains("dragDocument"),
      accepts: (el, target) => target.classList.contains("documents-container"),
    });

    documentDrake.on("drop", (el, target, source) => {
      if (source && source !== target) {
        // Update any necessary data or references for this document
        el.dataset.status = target.parentElement.innerText.split("\n")[0]
      }
      saveToLocalStorage();
    });
  }
  createDocumentForm.removeEventListener("submit", handleDocumentSubmit);
  createDocumentForm.addEventListener("submit", handleDocumentSubmit);
  function handleDocumentSubmit(event) {
    event.preventDefault();
    const columnID = document.getElementById("createDoc").dataset.id;
    const parentColumn = document.getElementById(columnID);

    // Get column index for status
    const columnIndex = parseInt(parentColumn.dataset.index || 0);
    const status = getStatusForColumn(columnIndex);

    const doc = {
      id: `doc-${Date.now()}`,
      title: document.getElementById("documentTitle").value,
      description:
        document.getElementById("documentDescription").value || "Description:",
      backgroundColor: "#08CF65",
      status: status,
      assignee:
        document.getElementById("documentAssignee").value || "Unassigned",
      labels:
        Array.from(document.getElementById("documentLabel").value.split(" ")) ||
        [],
    };

    const documentLineItem = createDocumentFromSaved(doc, columnIndex);
    const documentsContainer = parentColumn.querySelector(
      ".documents-container"
    );
    documentsContainer.appendChild(documentLineItem);

    createDocumentForm.reset();
    createDocumentForm.style.display = "none";
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) backdrop.remove();
    document.body.classList.remove("modal-open");

    saveToLocalStorage();
  }

  // Close button for document form
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    createDocumentForm.style.display = "none";
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) backdrop.remove();
    document.body.classList.remove("modal-open");
  });
  console.log("end of init");
}

// Add event listener for page unload
window.addEventListener("beforeunload", (event) => {
  saveToLocalStorage();
  event.returnValue = ""; // Prevent accidental closure without saving
  console.log("end of beforeunload");
});

// Add event listener for visibility change
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveToLocalStorage();
  }
});

// Initialize socket connection
socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("join-room", roomName, room);
});

socket.on("board-updated", (updatedBoard) => {
  console.log("Received board update:", updatedBoard);
  if (updatedBoard && updatedBoard.projectId === projectId) {
    loadFromLocalStorage(updatedBoard, true);
  }
});

socket.on("disconnect", () => {
  console.warn("Lost connection! Retrying in 5 seconds...");
  setTimeout(() => {
    socket.connect(); // Attempt reconnect
  }, 5000);
});
