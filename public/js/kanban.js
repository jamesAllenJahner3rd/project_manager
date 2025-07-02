//  import type { Drake } from "dragula";
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
let documentDrake; //: DocumentDrake;
let listOfColumn = [];
const projectId = currentProjectId;
const isAdmin = await (async () => {
    try {
        const currentUrl = window.location.href;
        const id = currentUrl.split("kanban")[1].split("?")[0];
        const response = await fetch(`/project/kanban/${id}/isAdmin`);
        const awaitingAdminBoolean = await response.json();
        return !!awaitingAdminBoolean;
    }
    catch (error) {
        console.error(`${error} Couldn't find whether the user is admin, kanban.js "areYouAdmin"`);
    }
})();
const socket = io(window.location.origin);
async function room() {
    try {
        let res = await fetch(`/profile/project/${projectId}/data`);
        if (!res.ok)
            throw new Error(`HTTP Error: ${res.status}`);
        console.log(/*res.json,*/ "end of room, async function room() ");
        return await res.json();
    }
    catch (error) {
        console.error("async function room() Fetch failed:", error);
        return null;
    }
}
const roomName = await room(); //**************************
console.log("roomName:", roomName);
var STATUS_BY_POSITION = [];
function setStateList() {
    let status = [];
    listOfColumn = Array.from(document.querySelectorAll("div ul.dragColumn"));

    listOfColumn.forEach((column, index) => {
        // Add column index for status tracking

        column.dataset.index = index.toString();
        listOfColumn[index] = column;
        status[index] = column.innerText.split("\n")[0];
    });
    console.log("end of setStateList");
    return { status, listOfColumn };
}
// async
// function createStatusMap(projectId: string) {
//   console.log("STATUS_BY_POSITION:", STATUS_BY_POSITION);
//   return STATUS_BY_POSITION; // Return it for use elsewhere
//   console.log("end of createStatusMap");
// }
// console.log("currentProject:", currentProject);
function getNextStatus(currentStatus) {
    if (STATUS_BY_POSITION.length === 0 || STATUS_BY_POSITION == null) {
        ({ status: STATUS_BY_POSITION, listOfColumn } = setStateList());
    }
    let key = (() => {
        for (let i = 0; i < STATUS_BY_POSITION.length; i++) {
            if (STATUS_BY_POSITION[+i] === currentStatus) {
                return i;
            }
        }
    })();
    if (key == null) {
        throw new Error("kanban.js getNewStatus key not found");
    }
    const nextColumnTitle = STATUS_BY_POSITION[+key + 1] || currentStatus;
    const nextColumn = listOfColumn.find((ul) => ul.querySelector("h1.title")?.textContent?.trim() === `${nextColumnTitle}`);
    if (!nextColumn) {
        throw new Error("404 nextColumn is null. Returning current status.");
    }
    //querySelector(`ul:has( nav h1[title=${STATUS_BY_POSITION[+key + 1]}])`);
    const documentNumber = nextColumn.querySelectorAll(".dragDocument").length;
    const maxDocumentCount = Number(nextColumn.querySelector("span.max-documents")?.textContent?.split(" ")[1]) || 0;
    if (maxDocumentCount == null)
        throw new Error("404 nextColumn was not found");
    // console.log("end of getNextStatus", documentNumber, maxDocumentCount);
    if (+documentNumber < +maxDocumentCount || maxDocumentCount === 0) {
        return STATUS_BY_POSITION[+key + 1]; // Don't allow loopback
    }
    else {
        alert("Max document limit reached");
        return STATUS_BY_POSITION[+key]; // loopback
    }
}
// Get status based on column position
function getStatusForColumn(status, columnIndex) {
    console.log("kanban columnIndex, getStatusForColumn()", columnIndex);
    if (typeof status === "undefined") {
        console.warn(`kanban.js getStatusForColumn status: ${status}`);
    }
    // console.log(
    //   "end of getStatusForColumn",
    //   "STATUS_BY_POSITION",
    //   status,
    //   "list of columns",
    //   listOfColumn
    // );
    // room() loadFromLocalStorage
    ({ status: STATUS_BY_POSITION, listOfColumn } = setStateList());
    return STATUS_BY_POSITION[+columnIndex];
}
// Handle progress click
async function handleProgressClick(documentId, currentStatus) {
    try {
        let { status: STATUS_BY_POSITION, listOfColumn } = setStateList();
        const nextStatus = getNextStatus(currentStatus);
        if (nextStatus === currentStatus)
            return; // No change needed
        const nextColumn = listOfColumn.find((column) => column.querySelector("h1.title")?.textContent?.trim() ===
            `${nextStatus}`);
        if (!nextColumn) {
            throw new Error("404 Didn't find the Next Column");
        }
        const maxDocuments = nextColumn.querySelector(`.max-documents`)?.textContent?.split(" ")[1] ??
            0;
        const currentDocuments = nextColumn.querySelector(`.document-count`)?.textContent?.split(" ")[1] ??
            0;
        if (+maxDocuments <= +currentDocuments) {
            alert("Max document limit reached");
            return;
        }
        // Find document and its current column
        let requestedDoc = document.getElementById(documentId);
        if (!requestedDoc) {
            throw new Error("Document was not found line 166 kanban.js");
        }
        requestedDoc = requestedDoc;
        const currentColumn = requestedDoc.closest(".dragColumn");
        if (!currentColumn)
            throw new Error("dragColumn column couldn't be found.");
        console.log(`Moving document ${documentId} from ${currentStatus} → ${nextStatus}`); //*****************************************
        // Find column index of target status
        let targetColumnIndex = -1;
        for (let index = 0; index < STATUS_BY_POSITION.length; index++) {
            if (STATUS_BY_POSITION[index] === nextStatus) {
                targetColumnIndex = index;
                break;
            }
        }
        if (targetColumnIndex === -1)
            return;
        // Get all columns and find target column
        const columns = Array.from(document.querySelectorAll(".dragColumn"));
        listOfColumn = columns;
        if (targetColumnIndex >= columns.length)
            return;
        const targetColumn = columns[targetColumnIndex];
        const targetContainer = targetColumn.querySelector(".documents-container");
        if (!targetContainer) {
            throw Error("404 documents-container not found");
        }
        // Remove from current column and append to target column
        if (requestedDoc.parentNode) {
            requestedDoc.parentNode.removeChild(requestedDoc);
        }
        else {
            console.warn("Document parent node not found.");
        }
        targetContainer.appendChild(requestedDoc);
        // Update document status data attribute
        requestedDoc.dataset.status = nextStatus;
        // Update the progress button appearance
        const progressBtn = requestedDoc.querySelector(".progress-button");
        if (progressBtn) {
            updateProgressButtonState(progressBtn, nextStatus);
        }
        // Update document counts
        updateDocumentCount(currentColumn);
        updateDocumentCount(targetColumn);
        // Save changes
        saveToLocalStorage();
        console.log(" end of handleProgressClick");
        if (STATUS_BY_POSITION == undefined || STATUS_BY_POSITION.length === 0) {
            let { status: STATUS_BY_POSITION, listOfColumn } = setStateList();
        }
    }
    catch (error) {
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
    console.log("loadFromLocalStorage kanban.js line 138 kanban", kanban, "parse");
    //JSON.parse(room))
    // const savedState = localStorage.getItem(`kanbanBoard-${projectId}`);
    const getSaved = await fetch(`/project/kanban/${kanban._id}/data`);
    const savedState = await getSaved.json();
    let boardState;
    if (emittedBoard) {
        boardState = emittedBoard;
    }
    else if (savedState) {
        boardState = savedState;
    }
    else if (kanban && kanban.columns.length > 0) {
        boardState = kanban;
    }
    else {
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
    if (!dragparent) {
        throw new Error("404: Element 'dragparent' not found");
    }
    dragparent.innerHTML = "";
    let listOfColumn = [];
    let { status: STATUS_BY_POSITION } = setStateList();
    listOfColumn = await Promise.all(boardState.columns.map(async (column, index) => {
        // Add column index for status tracking
        column.index = `${index}`;
        const newColumn = await createColumnFromSaved(column);
        dragparent.appendChild(newColumn);
        STATUS_BY_POSITION[index] = column.title;
        return newColumn;
    }));
    // const isAdmin = await areYouAdmin()
    if (isAdmin === true) {
        reinitializeDragula(dragparent, listOfColumn);
    }
    console.log("end of loadFromLocalStorage");
}
function saveToLocalStorage() {
    const boardState = {
        projectId: projectId,
        columns: Array.from(document.querySelectorAll("div ul.dragColumn")).map((column, columnIndex) => {
            const indexedColumn = column;
            const documents = Array.from(indexedColumn.querySelectorAll(".dragDocument")).map((mappedDoc) => {
                const el = mappedDoc;
                // Get status based on column position
                const status = getStatusForColumn(STATUS_BY_POSITION, columnIndex);
                let labels = el.querySelector(".labelsList")?.textContent ?? "";
                console.log("labels:", labels);
                return {
                    id: el.id,
                    title: el.querySelector("h2")?.textContent,
                    description: el.querySelector("p")?.textContent,
                    backgroundColor: el.style.backgroundColor || "#08CF65",
                    status,
                    assignee: el.querySelector(".assignedTo")?.textContent || "Unassigned",
                    labels: Array.from((el.querySelector(".labelsList")?.textContent ?? "")
                        .split(" ")
                        .filter(Boolean)),
                };
            });
            return {
                id: indexedColumn.id,
                title: indexedColumn.querySelector(".title")?.textContent,
                backgroundColor: indexedColumn.style.backgroundColor || "#f9f9f9",
                documents: documents,
                maxDocuments: indexedColumn
                    .querySelector("span.max-documents")
                    ?.textContent?.split(" ")[1],
                canAddDocuments: indexedColumn.querySelector(".canAddDocuments")
                    ? true
                    : false,
                canChangeDocumentColor: indexedColumn.querySelector(".canChangeDocumentColor")
                    ? true
                    : false,
                canDeleteDocuments: indexedColumn.querySelector(".canDeleteDocuments")
                    ? true
                    : false,
            };
        }),
    };
    // Update document counts
    document.querySelectorAll(".dragColumn").forEach((column) => {
        if (column instanceof HTMLUListElement) {
            updateDocumentCount(column);
        }
    });
    // Save to both localStorage and server
    // localStorage.setItem(`kanbanBoard-${projectId}`, JSON.stringify(boardState));
    // Emit to server with error handling
    try {
        socket.emit("updateBoard", boardState, (response) => {
            console.log("Server response:", response);
        });
    }
    catch (error) {
        console.error("Error saving to server:", error);
    }
    console.log("end of saveToLocalStorage", "STATUS_BY_POSITION", STATUS_BY_POSITION, "list of columns", listOfColumn);
}
function createDocumentFromSaved(savedDoc, columnIndex = 0) {
    const documentLineItem = document.createElement("li");
    documentLineItem.className = "dragDocument";
    documentLineItem.id = savedDoc.id || "";
    documentLineItem.style.backgroundColor = savedDoc.backgroundColor;
    // Set document status or default based on column
    // doesn't work on loading
    const status = savedDoc.status ?? getStatusForColumn(STATUS_BY_POSITION, columnIndex);
    if (!status) {
        console.warn("missing status on document element line 422");
    }
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
    docTitle.textContent = savedDoc.title;
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
    colorPicker.value = savedDoc.backgroundColor || "#08CF65";
    colorPicker.style.flexShrink = "0";
    colorPicker.addEventListener("input", (e) => {
        const target = e.target;
        if (!target)
            return;
        documentLineItem.style.backgroundColor = target.value;
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
    // progressBtn.innerText = "✓";
    // Set initial state based on status
    updateProgressButtonState(progressBtn, status);
    progressBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleProgressClick(documentLineItem.id, status);
    });
    iconContainer.appendChild(progressBtn);
    // Add delete button
    const deleteMe = document.createElement("button");
    deleteMe.className = "deleteButton";
    deleteMe.dataset.document = savedDoc.id;
    deleteMe.style.position = "static";
    deleteMe.style.flexShrink = "0";
    deleteMe.style.margin = "0";
    deleteMe.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this document?")) {
            if (!deleteMe.dataset.document) {
                throw new Error("404 cound not find document dataset id");
            }
            deleteDocument(deleteMe.dataset.document);
        }
    });
    iconContainer.appendChild(deleteMe);
    docContainer.appendChild(docHeader);
    // Add description
    const docDescrTitle = document.createElement("h4");
    docDescrTitle.textContent = "Description:";
    const docDescription = document.createElement("p");
    docDescription.textContent = savedDoc.description;
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
    docAssignee.textContent = `${savedDoc.assignee || "Unassigned"}`;
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
    docLabelsList.textContent = `${savedDoc.labels.join(" ")}`;
    docLabelsList.addEventListener("dblclick", () => edit(docLabelsList));
    // console.log(docLabelsList.textContent);
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
    // const isAdmin = await areYouAdmin ()
    const newColumn = document.createElement("ul");
    newColumn.className = "dragColumn";
    newColumn.id = column.id;
    newColumn.style.backgroundColor = column.backgroundColor;
    // Store column index as data attribute for status mapping
    newColumn.dataset.index = column.index || "0";
    const columnNav = document.createElement("nav");
    columnNav.className = "columnNav";
    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    // Add document button
    const newDocPopup = document.createElement("button");
    newDocPopup.className = "newDocPopupButton";
    newDocPopup.dataset.column = newColumn.id;
    newDocPopup.addEventListener("click", () => {
        if (!newDocPopup.dataset.column) {
            throw new Error("404 newDocPopup.dataset.column is undefined");
        }
        else {
            createDocumentPopup(newDocPopup.dataset.column);
        }
    });
    buttonContainer.appendChild(newDocPopup);
    // Add color picker
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.className = "column-color-picker";
    colorPicker.value = column.backgroundColor || "#f9f9f9";
    colorPicker.addEventListener("input", (e) => {
        const target = e.target;
        newColumn.style.backgroundColor = target.value;
        saveToLocalStorage();
    });
    buttonContainer.appendChild(colorPicker);
    // Add delete button
    const deleteMe = document.createElement("button");
    deleteMe.className = "deleteButton";
    deleteMe.dataset.column = newColumn.id;
    deleteMe.addEventListener("click", () => {
        if (!deleteMe.dataset.column) {
            throw new Error("404  Couldn't find deleteMe Dataset.column");
        }
        deleteDocument(deleteMe.dataset.column);
    });
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
    }
    else {
        column.documents.forEach((documentElement) => {
            const newDocument = createDocumentFromSaved(documentElement, +column.index);
            if (newDocument !== undefined) {
                documentsContainer.appendChild(newDocument);
            }
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
        }
        else {
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
function updateDocumentCount(requestColumn) {
    const documentCount = requestColumn.querySelector(".document-count");
    if (documentCount) {
        const count = requestColumn.querySelectorAll(".dragDocument").length;
        documentCount.textContent = `Documents: ${count}`;
    }
    console.log("end of updateDocumentCount");
}
function reinitializeDragula(dragparent, listOfColumn) {
    if (columnDrake)
        columnDrake.destroy();
    columnDrake = window.dragula([dragparent], {
        moves: (el, container, handle) => {
            return !!(el &&
                handle &&
                el.classList.contains("dragColumn") &&
                (handle.tagName === "NAV" || handle?.parentElement?.tagName === "NAV"));
        },
        accepts: (el, target) => {
            return !!(el &&
                el.classList &&
                el.classList.contains("dragColumn") &&
                target &&
                dragparent &&
                target === dragparent);
            //el.classList.contains("dragColumn") && target === dragparent;
        },
        direction: "horizontal",
    });
    if (documentDrake)
        documentDrake.destroy();
    // Update to use document containers
    const documentContainers = listOfColumn
        .map((column) => column.querySelector(".documents-container"))
        .filter((container) => container !== null);
    documentDrake = window.dragula(documentContainers, {
        moves: (el, container, handle) => {
            return !!(el && el.classList && el.classList.contains("dragDocument"));
        },
        accepts: (el, target) => {
            let isAcolumn = target?.classList?.contains("documents-container");
            let currentDocuments = target?.children?.length;
            let maxDocuments = target.nextElementSibling
                ?.querySelector(".max-documents")
                .textContent.split(" ")[1];
            if (maxDocuments === "∞") {
                maxDocuments = String(currentDocuments + 1);
            }
            return isAcolumn && currentDocuments < +maxDocuments;
        },
    });
    if (columnDrake) {
        columnDrake.on("drop", (el, target, source) => {
            if (source && source !== target) {
                source.removeChild(el);
            }
            // Update column indices after reordering
            listOfColumn = Array.from(document.querySelectorAll("div ul.dragColumn"));
            listOfColumn.forEach((column, index) => {
                column.dataset.index = String(index);
                STATUS_BY_POSITION[index] = column.innerText.split("\n")[0];
            });
            saveToLocalStorage();
            console.log("end of List of column, drop");
        });
    }
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
                const targetColumnIndex = parseInt(targetColumn.dataset.index || String(0));
                const newStatus = getStatusForColumn(STATUS_BY_POSITION, targetColumnIndex);
                // Update document status
                el.dataset.status = newStatus;
                // Update progress button appearance
                const progressBtnTemp = el.querySelector(".progress-button");
                if (progressBtnTemp) {
                    const drakeProgressBtn = progressBtnTemp;
                    updateProgressButtonState(drakeProgressBtn, newStatus);
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
        console.warn(`Document ${docID} not found for deletion. kanban.js line 509`);
        return;
    }
    if (theDoomedDocument) {
        theDoomedDocument?.parentNode?.removeChild(theDoomedDocument);
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
    rewrite.placeholder = text || "";
    rewrite.value = text || "";
    rewrite.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            element.textContent = rewrite.value || rewrite.placeholder;
            rewrite.remove();
            saveToLocalStorage();
        }
        else if (event.key === "Escape") {
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
        ?.getElementById(`${columnData}`)
        ?.querySelector(`.max-documents`)
        ?.textContent?.split(" ")[1];
    const currentDocuments = document
        ?.getElementById(`${columnData}`)
        ?.querySelector(`.document-count`)
        ?.textContent?.split(" ")[1];
    if (maxDocuments && currentDocuments && +maxDocuments <= +currentDocuments) {
        alert("Max document limit reached");
        return;
    }
    // else {
    //   throw new Error(
    //     "404 Couldn't find MaxDocuments or CurrentDocuments, kanban.js line 880"
    //   );
    // }
    const theDocPopupFormTemp = document.getElementById("createDocumentForm");
    if (!(theDocPopupFormTemp instanceof HTMLElement)) {
        throw new Error("404 Couldn't find #createDocumentForm, kanban.js line 884");
    }
    const theDocPopupForm = theDocPopupFormTemp;
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
    backdrop.style.display = "block";
    theDocPopupForm.style.display = "block";
    document.body.classList.add("modal-open");
    // const assigneeButton = document.getElementById("documentAssignee")
    // assigneeButton
    // adminList()
    const popupButtonTemp = document.getElementById("createDoc");
    if (!(popupButtonTemp instanceof HTMLElement)) {
        throw new Error("404 Couldn't find #createDoc, kanban.js line 900");
    }
    const popupButton = popupButtonTemp;
    popupButton.setAttribute("data-id", columnData);
    const documentTitle = document.getElementById("documentTitle");
    if (documentTitle !== null) {
        documentTitle?.focus();
    }
    console.log("end of createDocumentPopup");
}
function init(emittedBoard = null, emitted = false) {
    const createColumnForm = document.getElementById("createColumnForm");
    // if (!createColumnForm) {
    //   throw new Error("404 Couldn't find #createColumnForm");
    // }
    const createDocumentForm = document.getElementById("createDocumentForm");
    if (!createDocumentForm) {
        throw new Error("404 Couldn't find #createDocumentForm");
    }
    const filterDocumentForm = document.getElementById("filterDocumentForm");
    if (!filterDocumentForm) {
        throw new Error("404 Couldn't find #filterDocumentForm");
    }
    const dragparent = document.getElementById("dragparent");
    console.log("init started");
    // Load saved data first
    loadFromLocalStorage(emittedBoard, emitted);
    if (dragparent instanceof HTMLElement) {
        const test = dragparent;
        if (test.hasChildNodes() && isAdmin) {
            reinitializeDragula(test, listOfColumn);
            // Handle the drop event for columns
            if (columnDrake !== undefined) {
                columnDrake.on("drop", (el, target, source) => {
                    if (source && source !== target) {
                        source.removeChild(el); // Remove the original column from the source
                    }
                    // Update column indices after reordering
                    const columns = Array.from(document.querySelectorAll(".dragColumn"));
                    columns.forEach((columnParmeter, index) => {
                        const column = columnParmeter;
                        column.dataset.index = String(index);
                    });
                    saveToLocalStorage();
                });
            }
        }
    }
    // Update listOfColumn
    listOfColumn = Array.from(document.querySelectorAll(".dragColumn"));
    console.log(listOfColumn);
    // Handle the drop event for documents
    if (documentDrake) {
        documentDrake.on("drop", saveToLocalStorage);
    }
    if (createColumnForm) {
        createColumnForm?.removeEventListener("submit", handleColumnSubmit);
        createColumnForm?.addEventListener("submit", handleColumnSubmit);
    }
    if (filterDocumentForm !== null && listOfColumn.length > 0) {
        filterDocumentForm?.removeEventListener("submit", setDocumentFilter);
        filterDocumentForm?.addEventListener("submit", setDocumentFilter);
    }
    // filterDocumentForm.addEventListener("click", (e) => setDocumentFilter(e));
    async function handleColumnSubmit(event) {
        event.preventDefault();
        const columnContent = document.getElementById("columnContent")?.value;
        const maxDocuments = document.getElementById("maxDocuments").value ||
            "∞";
        const column = {
            id: `column-${Date.now()}`,
            title: columnContent,
            backgroundColor: "#f9f9f9",
            documents: [],
            index: String(listOfColumn.length),
            maxDocuments,
        };
        const newColumn = await createColumnFromSaved(column);
        const dragparent = document.getElementById("dragparent");
        if (!dragparent) {
            throw new Error("404 Couldn't find the Column from DB");
        }
        dragparent.appendChild(newColumn);
        listOfColumn.push(newColumn);
        const modalTemp = document.querySelector(".modalWrapper");
        if (!modalTemp) {
            throw new Error("404 Couldn't find the class modalWrapper");
        }
        const modal = modalTemp;
        modal.style.display = "none";
        // if (!createColumnForm) {
        //   throw new Error("404 CreateColumnForm was null");
        // }
        createDocumentForm.reset();
        saveToLocalStorage();
        let { status: STATUS_BY_POSITION } = setStateList();
        // Reinitialize dragula for documents with new column
        documentDrake.destroy();
        listOfColumn = Array.from(document.querySelectorAll(".dragColumn"));
        // Update to use document containers consistently
        const documentContainers = listOfColumn
            .map((column) => column.querySelector(".documents-container"))
            .filter((container) => container !== null);
        documentDrake = window.dragula(documentContainers, {
            moves: (el, container, handle) => !!(el && el.classList.contains("dragDocument")),
            accepts: (el, target) => !!(target && target.classList.contains("documents-container")),
        });
        documentDrake.on("drop", (el, target, source) => {
            if (source && source !== target) {
                // Update any necessary data or references for this document
                el.dataset.status = target.parentElement.innerText.split("\n")[0];
            }
            saveToLocalStorage();
        });
    }
    if (!createDocumentForm) {
        throw new Error("404 Couldn't find createDocumentForm");
    }
    const form = createDocumentForm;
    form.removeEventListener("submit", handleDocumentSubmit);
    form.addEventListener("submit", handleDocumentSubmit);
    function handleDocumentSubmit(event) {
        event.preventDefault();
        const columnID = document?.getElementById("createDoc")?.dataset.id;
        if (!columnID) {
            throw new Error("404 Couldn't find the #createDoc element, kanban.js ~1036");
        }
        const parentColumn = document.getElementById(columnID);
        // Get column index for status
        const columnIndex = parseInt(parentColumn?.dataset?.index || String(0));
        if (STATUS_BY_POSITION.length === 0) {
            ({ status: STATUS_BY_POSITION, listOfColumn } = setStateList());
        }
        const status = getStatusForColumn(STATUS_BY_POSITION, columnIndex);
        const title = document.getElementById("documentTitle").value ??
            "Double click to add a Title";
        let description = document.getElementById("documentDescription")
            ?.value ?? "Description:";
        if (description !== null) {
            description = description;
        }
        const doc = {
            id: `doc-${Date.now()}`,
            title,
            description,
            backgroundColor: "#08CF65",
            status,
            assignee: document.getElementById("documentAssignee")
                .value || "Unassigned",
            labels: Array.from(document.getElementById("documentLabel").value.split(" ")) || [],
        };
        const documentLineItem = createDocumentFromSaved(doc, columnIndex);
        let documentsContainer = parentColumn?.querySelector(".documents-container");
        if (!documentsContainer) {
            throw new Error("404 Couldn't find  class documents-container");
        }
        // if (!documentLineItem) {
        //   throw new Error("404 Couldn't find the documentLineItem");
        // }
        if (documentLineItem) {
            documentsContainer.appendChild(documentLineItem);
        }
        if (!createDocumentForm) {
            throw new Error("404 Couldn't find the createDocumentForm");
        }
        createDocumentForm.reset();
        createDocumentForm.style.display = "none";
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop)
            backdrop.remove();
        document.body.classList.remove("modal-open");
        saveToLocalStorage();
    }
    // Close button for document form
    const closeBtn = document.querySelector(".close-btn");
    if (!closeBtn) {
        throw new Error("404 Couldn't find closeBtn, Kanban.js ~1089");
    }
    closeBtn.addEventListener("click", () => {
        createDocumentForm.style.display = "none";
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop)
            backdrop.remove();
        document.body.classList.remove("modal-open");
    });
    const clear = document.getElementById("clearFilters");
    if (clear) {
        document
            .getElementById("clearFilters")
            ?.addEventListener("click", (event) => {
            event.preventDefault();
            // setStateList()
            document
                .querySelectorAll(".dragDocument")
                .forEach((li) => (li.style.display = "flex"));
            document.querySelector("div:has(#filterDocumentForm)").style.display = "none";
        });
    }
    console.log("end of init");
    ({ status: STATUS_BY_POSITION, listOfColumn } = setStateList());
}
// Add event listener for page unload
window.addEventListener("beforeunload", (event) => {
    socket.emit("disconnect");
    event.returnValue = ""; // Prevent accidental closure without saving
    console.log("end of beforeunload");
});
// Add event listener for visibility change
// document.addEventListener("visibilitychange", () => {
//   if (document.visibilityState === "hidden") {
//     saveToLocalStorage();
//   }
// });
async function getUserId() {
    try {
        const response = await fetch("/profile/getId");
        const userId = await response.json();
        return userId;

    }
    catch (error) {
        console.error(`${error} Couldn't find the user's ID`);
    }
}
// Initialize socket connection
socket.on("connect", async () => {
    console.log("Connected to server");
    const userId = await getUserId();
    socket.emit("join-room", `kanban${projectId}`, userId);
});
if (!socket.connected) {
    console.log("Socket not connected — connecting now...");
    socket.connect();
    const userId = await getUserId();
    socket.emit("join-room", `kanban${projectId}`, userId);
}
else {
    console.log("Socket already connected.");
    const userId = await getUserId();
    socket.emit("join-room", `kanban${projectId}`, userId);
}
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
async function setDocumentFilter(event) {
    event.preventDefault();
    document
        .querySelectorAll("li")
        .forEach((li) => (li.style.display = "flex"));
    const assignee = document.getElementById("filterAssignee").value
        .toLowerCase()
        .trim() ?? "";
    const labels = document.getElementById("filterLabel").value
        .toLowerCase()
        .trim()
        .split(" ") ?? "";
    const filterTitle = document.getElementById("filterTitle").value
        .toLowerCase()
        .trim() ?? "";
    const filterWord = document.getElementById("filterWord").value
        .toLowerCase()
        .trim() ?? "";
    const filteredCriterion = [assignee, labels, filterTitle, filterWord];
    if (listOfColumn.length > 0) {
        setStateList();
    }
    let documentList = listOfColumn.flatMap((ul) => {
        let tempList = [];
        if (assignee) {
            tempList.push(Array.from(ul.querySelectorAll(".dragDocument")).filter((el) => el?.textContent?.includes(`Assignee:${assignee}`)));
        }
        if (!(labels.length === 1 && labels[0] === "")) {
            tempList.push(listOfColumn.flatMap((ul) => {
                const anArray = Array.from(ul.querySelectorAll(".dragDocument"));
                const anotherArray = anArray.filter((li) => {
                    if (li && li.textContent) {
                        let liContent = li.textContent
                            .toLowerCase()
                            .split("labels:")[1]
                            .trim()
                            .split(" ");
                        let truth = labels.every((label) => liContent.includes(label));
                        return !!truth;
                    }
                });
                return anotherArray;
            }));
        }
        if (filterTitle) {
            tempList.push(listOfColumn.flatMap((ul) => {
                const anArray = Array.from(ul.querySelectorAll(".dragDocument"));
                const anotherArray = anArray.filter((li) => {
                    if (li && li.textContent) {
                        let liContent = li.textContent
                            .toLowerCase()
                            .trim()
                            .split("description:")[0];
                        let truth = liContent.includes(filterTitle);
                        return !!truth;
                    }
                });
                return anotherArray;
            }));
        }
        if (filterWord) {
            tempList.push(listOfColumn.flatMap((ul) => Array.from(ul.querySelectorAll(".dragDocument")).filter((li) => {
                if (li && li.textContent) {
                    let liContent = li.textContent
                        .toLowerCase()
                        .replace("description:", " ")
                        .replace("assignee:", " ")
                        .replace("labels:", " ");
                    let truth = liContent.includes(filterWord);
                    return !!truth;
                }
            })));
        }
        return tempList.flat();
    });
    documentList.forEach((li) => (li.style.display = "none"));
    document.querySelector("div:has(#filterDocumentForm)").style.display = "none";
}
export {};