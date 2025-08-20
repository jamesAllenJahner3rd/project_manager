"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
//  import type { Drake } from "dragula";
console.log("kanban.js has loaded");
document.addEventListener("DOMContentLoaded", function () {
    init();
});
var currentProject = null;
var currentUrl = window.location.href;
var currentProjectId = (_a = currentUrl.split("kanban")[1]) === null || _a === void 0 ? void 0 : _a.split("?")[0];
if (!currentProjectId) {
    console.error("Project ID not found in URL");
}
var columnDrake;
var documentDrake; //: DocumentDrake;
var listOfColumn = [];
var projectId = currentProjectId;
var isAdmin = await (function () { return __awaiter(void 0, void 0, void 0, function () {
    var currentUrl_1, id, response, awaitingAdminBoolean, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                currentUrl_1 = window.location.href;
                id = currentUrl_1.split("kanban")[1].split("?")[0];
                return [4 /*yield*/, fetch("/project/kanban/".concat(id, "/isAdmin"))];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                awaitingAdminBoolean = _a.sent();
                return [2 /*return*/, !!awaitingAdminBoolean];
            case 3:
                error_1 = _a.sent();
                console.error("".concat(error_1, " Couldn't find whether the user is admin, kanban.js \"areYouAdmin\""));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })();
var socket = io(window.location.origin);
function room() {
    return __awaiter(this, void 0, void 0, function () {
        var res, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/profile/project/".concat(projectId, "/data"))];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("HTTP Error: ".concat(res.status));
                    console.log(/*res.json,*/ "end of room, async function room() ");
                    return [4 /*yield*/, res.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_2 = _a.sent();
                    console.error("async function room() Fetch failed:", error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var roomName = await room(); //**************************
console.log("roomName:", roomName);
var STATUS_BY_POSITION = [];
function setStateList() {
    var status = [];
    listOfColumn = Array.from(document.querySelectorAll("div ul.dragColumn"));
    listOfColumn.forEach(function (column, index) {
        // Add column index for status tracking
        column.dataset.index = index.toString();
        listOfColumn[index] = column;
        status[index] = column.innerText.split("\n")[0];
    });
    console.log("end of setStateList");
    return { status: status, listOfColumn: listOfColumn };
}
// async
// function createStatusMap(projectId: string) {
//   console.log("STATUS_BY_POSITION:", STATUS_BY_POSITION);
//   return STATUS_BY_POSITION; // Return it for use elsewhere
//   console.log("end of createStatusMap");
// }
// console.log("currentProject:", currentProject);
function getNextStatus(currentStatus) {
    var _a;
    var _b, _c;
    if (STATUS_BY_POSITION.length === 0 || STATUS_BY_POSITION == null) {
        (_a = setStateList(), STATUS_BY_POSITION = _a.status, listOfColumn = _a.listOfColumn);
    }
    var key = (function () {
        for (var i = 0; i < STATUS_BY_POSITION.length; i++) {
            if (STATUS_BY_POSITION[+i] === currentStatus) {
                return i;
            }
        }
    })();
    if (key == null) {
        throw new Error("kanban.js getNewStatus key not found");
    }
    var nextColumnTitle = STATUS_BY_POSITION[+key + 1] || currentStatus;
    var nextColumn = listOfColumn.find(function (ul) { var _a, _b; return ((_b = (_a = ul.querySelector("h1.title")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) === "".concat(nextColumnTitle); });
    if (!nextColumn) {
        throw new Error("404 nextColumn is null. Returning current status.");
    }
    //querySelector(`ul:has( nav h1[title=${STATUS_BY_POSITION[+key + 1]}])`);
    var documentNumber = nextColumn.querySelectorAll(".dragDocument").length;
    var maxDocumentCount = Number((_c = (_b = nextColumn.querySelector("span.max-documents")) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.split(" ")[1]) || 0;
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
    var _a;
    console.log("kanban columnIndex, getStatusForColumn()", columnIndex);
    if (typeof status === "undefined") {
        console.warn("kanban.js getStatusForColumn status: ".concat(status));
    }
    // console.log(
    //   "end of getStatusForColumn",
    //   "STATUS_BY_POSITION",
    //   status,
    //   "list of columns",
    //   listOfColumn
    // );
    // room() loadFromLocalStorage
    (_a = setStateList(), STATUS_BY_POSITION = _a.status, listOfColumn = _a.listOfColumn);
    return STATUS_BY_POSITION[+columnIndex];
}
// Handle progress click
function handleProgressClick(documentId, currentStatus) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, STATUS_BY_POSITION_1, listOfColumn_1, nextStatus_1, nextColumn, maxDocuments, currentDocuments, requestedDoc, currentColumn, targetColumnIndex, index, columns, targetColumn, targetContainer, progressBtn, analytics, _b, STATUS_BY_POSITION_2, listOfColumn_2;
        var _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            try {
                _a = setStateList(), STATUS_BY_POSITION_1 = _a.status, listOfColumn_1 = _a.listOfColumn;
                nextStatus_1 = getNextStatus(currentStatus);
                if (nextStatus_1 === currentStatus)
                    return [2 /*return*/]; // No change needed
                nextColumn = listOfColumn_1.find(function (column) {
                    var _a, _b;
                    return ((_b = (_a = column.querySelector("h1.title")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) ===
                        "".concat(nextStatus_1);
                });
                if (!nextColumn) {
                    throw new Error("404 Didn't find the Next Column");
                }
                maxDocuments = (_e = (_d = (_c = nextColumn.querySelector(".max-documents")) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.split(" ")[1]) !== null && _e !== void 0 ? _e : 0;
                currentDocuments = (_h = (_g = (_f = nextColumn.querySelector(".document-count")) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.split(" ")[1]) !== null && _h !== void 0 ? _h : 0;
                if (+maxDocuments <= +currentDocuments) {
                    alert("Max document limit reached");
                    return [2 /*return*/];
                }
                requestedDoc = document.getElementById(documentId);
                if (!requestedDoc) {
                    throw new Error("Document was not found line 166 kanban.js");
                }
                requestedDoc = requestedDoc;
                currentColumn = requestedDoc.closest(".dragColumn");
                if (!currentColumn)
                    throw new Error("dragColumn column couldn't be found.");
                console.log("Moving document ".concat(documentId, " from ").concat(currentStatus, " \u2192 ").concat(nextStatus_1)); //*****************************************
                targetColumnIndex = -1;
                for (index = 0; index < STATUS_BY_POSITION_1.length; index++) {
                    if (STATUS_BY_POSITION_1[index] === nextStatus_1) {
                        targetColumnIndex = index;
                        break;
                    }
                }
                if (targetColumnIndex === -1)
                    return [2 /*return*/];
                columns = Array.from(document.querySelectorAll(".dragColumn"));
                listOfColumn_1 = columns;
                if (targetColumnIndex >= columns.length)
                    return [2 /*return*/];
                targetColumn = columns[targetColumnIndex];
                targetContainer = targetColumn.querySelector(".documents-container");
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
                requestedDoc.dataset.status = nextStatus_1;
                progressBtn = requestedDoc.querySelector(".progress-button");
                if (progressBtn) {
                    updateProgressButtonState(progressBtn, nextStatus_1);
                }
                // Update document counts
                if (requestedDoc.dataset.analytics != undefined) {
                    analytics = JSON.parse(requestedDoc.dataset.analytics);
                    analytics[currentColumn.id].push(Date.now());
                    if (!analytics[targetColumn.id]) {
                        analytics[targetColumn.id] = [];
                    }
                    analytics[targetColumn.id].push(Date.now());
                    requestedDoc.dataset.analytics = JSON.stringify(analytics);
                }
                updateDocumentCount(currentColumn);
                updateDocumentCount(targetColumn);
                // Save changes
                saveToLocalStorage();
                console.log(" end of handleProgressClick");
                if (STATUS_BY_POSITION_1 == undefined || STATUS_BY_POSITION_1.length === 0) {
                    _b = setStateList(), STATUS_BY_POSITION_2 = _b.status, listOfColumn_2 = _b.listOfColumn;
                }
            }
            catch (error) {
                console.error("Error updating document status:", error);
                // Use existing error handling - no custom error states
            }
            return [2 /*return*/];
        });
    });
}
// Update progress button appearance based on status
function updateProgressButtonState(button, status) {
    // Clear any existing classes
    button.className = "progress-button";
    button.title = "Status: ".concat(status);
    button.textContent = "✓"; //'&#10003'
    console.log("end of updateProgressButtonState");
}
socket.on("board-updated", function (updatedBoard) {
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
function loadFromLocalStorage(emittedBoard, emitted) {
    return __awaiter(this, void 0, void 0, function () {
        var kanban, getSaved, savedState, boardState, dragparent, listOfColumn, STATUS_BY_POSITION;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, room()];
                case 1:
                    kanban = _a.sent();
                    if (!kanban || typeof kanban !== "object") {
                        console.error("Kanban data is not in an expected object format:", kanban);
                    }
                    console.log("loadFromLocalStorage kanban.js line 138 kanban", kanban, "parse");
                    return [4 /*yield*/, fetch("/project/kanban/".concat(kanban._id, "/data"))];
                case 2:
                    getSaved = _a.sent();
                    return [4 /*yield*/, getSaved.json()];
                case 3:
                    savedState = _a.sent();
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
                        return [2 /*return*/];
                    }
                    dragparent = document.getElementById("dragparent");
                    if (!dragparent) {
                        throw new Error("404: Element 'dragparent' not found");
                    }
                    dragparent.innerHTML = "";
                    listOfColumn = [];
                    STATUS_BY_POSITION = setStateList().status;
                    return [4 /*yield*/, Promise.all(boardState.columns.map(function (column, index) { return __awaiter(_this, void 0, void 0, function () {
                            var newColumn;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // Add column index for status tracking
                                        column.index = "".concat(index);
                                        return [4 /*yield*/, createColumnFromSaved(column)];
                                    case 1:
                                        newColumn = _a.sent();
                                        dragparent.appendChild(newColumn);
                                        STATUS_BY_POSITION[index] = column.title;
                                        return [2 /*return*/, newColumn];
                                }
                            });
                        }); }))];
                case 4:
                    listOfColumn = _a.sent();
                    // const isAdmin = await areYouAdmin()
                    if (isAdmin === true) {
                        reinitializeDragula(dragparent, listOfColumn);
                    }
                    console.log("end of loadFromLocalStorage");
                    return [2 /*return*/];
            }
        });
    });
}
function saveToLocalStorage() {
    var boardState = {
        projectId: projectId,
        columns: Array.from(document.querySelectorAll("div ul.dragColumn")).map(function (column, columnIndex) {
            var _a, _b, _c;
            var indexedColumn = column;
            var documents = Array.from(indexedColumn.querySelectorAll(".dragDocument")).map(function (mappedDoc) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                var el = mappedDoc;
                // Get status based on column position
                var status = getStatusForColumn(STATUS_BY_POSITION, columnIndex);
                var labels = (_b = (_a = el.querySelector(".labelsList")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
                console.log("labels:", labels);
                var tempAnalytics = (_c = el.dataset.analytics) !== null && _c !== void 0 ? _c : "{Error Analytics was not found}";
                console.log(el.dataset.blockTimeStamp);
                ///string to array
                var blockTimeStamp = (_d = el.dataset.blockTimeStamp) !== null && _d !== void 0 ? _d : "";
                var blockTimeStampArray = blockTimeStamp.split(",");
                blockTimeStampArray = blockTimeStampArray.flatMap(function (aString) {
                    return aString ? Number(aString) : [];
                });
                return {
                    id: el.id,
                    title: (_e = el.querySelector("h2")) === null || _e === void 0 ? void 0 : _e.textContent,
                    description: (_f = el.querySelector("p")) === null || _f === void 0 ? void 0 : _f.textContent,
                    backgroundColor: el.style.backgroundColor || "#08CF65",
                    status: status,
                    assignee: ((_g = el.querySelector(".assignedTo")) === null || _g === void 0 ? void 0 : _g.textContent) || "Unassigned",
                    labels: Array.from(((_j = (_h = el.querySelector(".labelsList")) === null || _h === void 0 ? void 0 : _h.textContent) !== null && _j !== void 0 ? _j : "")
                        .split(" ")
                        .filter(Boolean)),
                    columnLifeTime: JSON.parse(tempAnalytics),
                    blocked: el.dataset.blocked,
                    blockTimeStamp: blockTimeStampArray,
                };
            });
            return {
                id: indexedColumn.id,
                title: (_a = indexedColumn.querySelector(".title")) === null || _a === void 0 ? void 0 : _a.textContent,
                backgroundColor: indexedColumn.style.backgroundColor || "#f9f9f9",
                documents: documents,
                maxDocuments: (_c = (_b = indexedColumn
                    .querySelector("span.max-documents")) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.split(" ")[1],
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
    document.querySelectorAll(".dragColumn").forEach(function (column) {
        if (column instanceof HTMLUListElement) {
            updateDocumentCount(column);
        }
    });
    // Save to both localStorage and server
    // localStorage.setItem(`kanbanBoard-${projectId}`, JSON.stringify(boardState));
    // Emit to server with error handling
    try {
        socket.emit("updateBoard", boardState, function (response) {
            console.log("Server response:", response);
        });
    }
    catch (error) {
        console.error("Error saving to server:", error);
    }
    console.log("end of saveToLocalStorage", "STATUS_BY_POSITION", STATUS_BY_POSITION, "list of columns", listOfColumn);
}
function createDocumentFromSaved(savedDoc, columnIndex) {
    var _a, _b;
    if (columnIndex === void 0) { columnIndex = 0; }
    var documentLineItem = document.createElement("li");
    documentLineItem.className = "dragDocument";
    documentLineItem.id = savedDoc.id || "";
    documentLineItem.style.backgroundColor = savedDoc.backgroundColor;
    // Set document status or default based on column
    // doesn't work on loading
    var status = (_a = savedDoc.status) !== null && _a !== void 0 ? _a : getStatusForColumn(STATUS_BY_POSITION, columnIndex);
    if (!status) {
        console.warn("missing status on document element line 422");
    }
    documentLineItem.dataset.status = status;
    documentLineItem.dataset.analytics = JSON.stringify(savedDoc.columnLifeTime);
    documentLineItem.dataset.blocked = (_b = String(savedDoc.blocked)) !== null && _b !== void 0 ? _b : "false";
    documentLineItem.dataset.blockTimeStamp = String(savedDoc.blockTimeStamp);
    var docContainer = document.createElement("div");
    docContainer.className = "document-container";
    // Add title and description in a content container
    var contentContainer = document.createElement("div");
    contentContainer.className = "document-content-container";
    contentContainer.style.width = "100%";
    contentContainer.style.boxSizing = "border-box";
    contentContainer.style.overflow = "hidden"; // Prevent text from overflowing
    var docHeader = document.createElement("div");
    // Add title
    var docTitle = document.createElement("h2");
    docTitle.textContent = savedDoc.title;
    docTitle.style.fontWeight = "bold";
    docTitle.style.wordWrap = "break-word"; // Allow long words to break
    docTitle.addEventListener("dblclick", function () { return edit(docTitle); });
    docHeader.appendChild(docTitle);
    var iconContainer = document.createElement("div");
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
    var colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.className = "document-color-picker";
    colorPicker.value = savedDoc.backgroundColor || "#08CF65";
    colorPicker.style.flexShrink = "0";
    colorPicker.addEventListener("input", function (e) {
        var target = e.target;
        if (!target)
            return;
        documentLineItem.style.backgroundColor = target.value;
        saveToLocalStorage();
    });
    iconContainer.appendChild(colorPicker);
    // Add progress button
    var progressBtn = document.createElement("button");
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
    progressBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        handleProgressClick(documentLineItem.id, status);
    });
    iconContainer.appendChild(progressBtn);
    // Add delete button
    var deleteMe = document.createElement("button");
    deleteMe.className = "deleteButton";
    deleteMe.dataset.document = savedDoc.id;
    deleteMe.style.position = "static";
    deleteMe.style.flexShrink = "0";
    deleteMe.style.margin = "0";
    deleteMe.addEventListener("click", function () {
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
    var docDescrTitle = document.createElement("h4");
    docDescrTitle.textContent = "Description:";
    var docDescription = document.createElement("p");
    docDescription.textContent = savedDoc.description;
    docDescription.style.wordWrap = "break-word"; // Allow long words to break
    docDescription.addEventListener("dblclick", function () { return edit(docDescription); });
    contentContainer.appendChild(docDescrTitle);
    contentContainer.appendChild(docDescription);
    docContainer.appendChild(contentContainer);
    // Add assignee
    var docAssigneeContainer = document.createElement("div");
    var docAssigneeTitle = document.createElement("h4");
    docAssigneeTitle.textContent = "Assignee:";
    var docAssignee = document.createElement("p");
    docAssignee.className = "assignedTo";
    docAssignee.textContent = "".concat(savedDoc.assignee || "Unassigned");
    docAssigneeContainer.className = "document-assignee-container";
    docAssigneeContainer.style.display = "flex";
    docAssigneeContainer.style.alignItems = "Baseline";
    docAssigneeContainer.appendChild(docAssigneeTitle);
    docAssigneeContainer.appendChild(docAssignee);
    contentContainer.appendChild(docAssigneeContainer);
    // Add labels
    var docLabelsContainer = document.createElement("div");
    var docLabelsTitle = document.createElement("h4");
    docLabelsTitle.textContent = "Labels:";
    var docLabelsList = document.createElement("p");
    docLabelsList.className = "labelsList";
    docLabelsList.textContent = "".concat(savedDoc.labels.join(" "));
    docLabelsList.addEventListener("dblclick", function () { return edit(docLabelsList); });
    // console.log(docLabelsList.textContent);
    // Create icon container div
    docLabelsContainer.appendChild(docLabelsTitle);
    docLabelsContainer.appendChild(docLabelsList);
    // docAssigneeContainer.children.forEach((child) => {console.log(child.textContent)});
    contentContainer.appendChild(docLabelsContainer);
    documentLineItem.appendChild(docContainer);
    var blockedButton = document.createElement("button");
    blockedButton.className = "document-blocked-button";
    blockedButton.style.borderRadius = "6px";
    blockedButton.style.alignSelf = "flex-end";
    blockedButton.style.flexShrink = "0";
    if (documentLineItem.dataset.blocked === "false") {
        blockedButton.textContent = "Blocked?";
        blockedButton.style.backgroundColor = "lightGrey";
        blockedButton.style.boxShadow = "1px 1px";
    }
    else {
        blockedButton.style.boxShadow = "-1px -1px";
        blockedButton.textContent = "Blocked";
        blockedButton.style.backgroundColor = "red";
    }
    blockedButton.addEventListener("click", function (e) {
        var target = e.target;
        if (target != null &&
            target.parentElement &&
            target.parentElement.dataset.blocked === "false") {
            blockedButton.textContent = "Blocked?";
            blockedButton.style.backgroundColor = "lightGrey";
            blockedButton.style.boxShadow = "1px 1px";
            target.parentElement.dataset.blocked = "true";
        }
        else {
            blockedButton.style.boxShadow = "-1px -1px";
            blockedButton.textContent = "Blocked";
            blockedButton.style.backgroundColor = "red";
            if (target.parentElement) {
                target.parentElement.dataset.blocked = "false";
            }
        }
        //console.log(`target.parentElement ${target.parentElement}, target.parentElement.dataset.blockTimeStamp ${target.parentElement.dataset.blockTimeStamp}`)
        if (target.parentElement != null &&
            target.parentElement.dataset.blockTimeStamp === null) {
            target.parentElement.dataset.blockTimeStamp = "";
        }
        if (target.parentElement !== null &&
            target.parentElement.dataset.blockTimeStamp !== undefined &&
            typeof target.parentElement.dataset.blockTimeStamp === "string") {
            var tempTimeStamp = "";
            // savedDoc.blockTimeStamp.forEach((e) => tempTimeStamp.concat(`,${e}`));
            // target.parentElement.dataset.blockTimeStamp = tempTimeStamp;
            target.parentElement.dataset.blockTimeStamp =
                target.parentElement.dataset.blockTimeStamp.concat(",".concat(Date.now()));
        }
        // target.parentElement.dataset.blockTimeStamp = target.parentElement.dataset.blockTimeStamp.concat(`,${Date.now()}`)
        // let tempTimeStamp: (number | string)[] = (target.parentElement.dataset.blockTimeStamp).split(",")
        // tempTimeStamp.map((aString) => Number(aString))
        // tempTimeStamp.push(Date.now())
        // tempTimeStamp.
        // target.parentElement.dataset.blockTimeStamp = tempTimeStamp
        // }
        if (!target)
            return;
        saveToLocalStorage();
    });
    documentLineItem.appendChild(blockedButton);
    console.log("end of createDocumentFromSaved");
    return documentLineItem;
}
function createColumnFromSaved(column) {
    return __awaiter(this, void 0, void 0, function () {
        var newColumn, columnNav, buttonContainer, newDocPopup, colorPicker, deleteMe, title, documentsContainer, columnFooter, documentCount, maxDocumentCount, maxTextContent;
        return __generator(this, function (_a) {
            newColumn = document.createElement("ul");
            newColumn.className = "dragColumn";
            newColumn.id = column.id;
            newColumn.style.backgroundColor = column.backgroundColor;
            // Store column index as data attribute for status mapping
            newColumn.dataset.index = column.index || "0";
            columnNav = document.createElement("nav");
            columnNav.className = "columnNav";
            buttonContainer = document.createElement("div");
            buttonContainer.className = "button-container";
            newDocPopup = document.createElement("button");
            newDocPopup.className = "newDocPopupButton";
            newDocPopup.dataset.column = newColumn.id;
            newDocPopup.addEventListener("click", function () {
                if (!newDocPopup.dataset.column) {
                    throw new Error("404 newDocPopup.dataset.column is undefined");
                }
                else {
                    createDocumentPopup(newDocPopup.dataset.column);
                }
            });
            buttonContainer.appendChild(newDocPopup);
            colorPicker = document.createElement("input");
            colorPicker.type = "color";
            colorPicker.className = "column-color-picker";
            colorPicker.value = column.backgroundColor || "#f9f9f9";
            colorPicker.addEventListener("input", function (e) {
                var target = e.target;
                newColumn.style.backgroundColor = target.value;
                saveToLocalStorage();
            });
            buttonContainer.appendChild(colorPicker);
            deleteMe = document.createElement("button");
            deleteMe.className = "deleteButton";
            deleteMe.dataset.column = newColumn.id;
            deleteMe.addEventListener("click", function () {
                if (!deleteMe.dataset.column) {
                    throw new Error("404  Couldn't find deleteMe Dataset.column");
                }
                deleteDocument(deleteMe.dataset.column);
            });
            buttonContainer.appendChild(deleteMe);
            columnNav.appendChild(buttonContainer);
            title = document.createElement("h1");
            title.className = "title";
            title.textContent = column.title;
            title.addEventListener("dblclick", function () { return edit(title); });
            columnNav.appendChild(title);
            newColumn.appendChild(columnNav);
            documentsContainer = document.createElement("div");
            documentsContainer.className = "documents-container";
            newColumn.appendChild(documentsContainer);
            // Add documents to the container
            if (!column.documents || column.documents.length === 0) {
                console.warn("No documents found for column: ".concat(column.title));
            }
            else {
                column.documents.forEach(function (documentElement) {
                    //block time stamp should be a array
                    var newDocument = createDocumentFromSaved(documentElement, +column.index);
                    if (newDocument !== undefined) {
                        documentsContainer.appendChild(newDocument);
                    }
                });
            }
            columnFooter = document.createElement("div");
            columnFooter.className = "column-footer";
            documentCount = document.createElement("span");
            documentCount.className = "document-count";
            documentCount.textContent = "Documents: ".concat(column.documents.length);
            columnFooter.appendChild(documentCount);
            maxDocumentCount = document.createElement("span");
            maxDocumentCount.className = "max-document-count";
            maxTextContent = function () {
                if (column.maxDocuments === 0) {
                    return "None";
                }
                else {
                    return column.maxDocuments;
                }
            };
            maxDocumentCount.classList.add("max-documents");
            maxDocumentCount.textContent = "Max: ".concat(maxTextContent());
            newColumn.appendChild(columnFooter);
            columnFooter.appendChild(maxDocumentCount);
            console.log("end of createColumnFromSaved");
            return [2 /*return*/, newColumn];
        });
    });
}
function updateDocumentCount(requestColumn) {
    var documentCount = requestColumn.querySelector(".document-count");
    if (documentCount) {
        var count = requestColumn.querySelectorAll(".dragDocument").length;
        documentCount.textContent = "Documents: ".concat(count);
    }
    console.log("end of updateDocumentCount");
}
function reinitializeDragula(dragparent, listOfColumn) {
    if (columnDrake)
        columnDrake.destroy();
    columnDrake = window.dragula([dragparent], {
        moves: function (el, container, handle) {
            var _a;
            return !!(el &&
                handle &&
                el.classList.contains("dragColumn") &&
                (handle.tagName === "NAV" || ((_a = handle === null || handle === void 0 ? void 0 : handle.parentElement) === null || _a === void 0 ? void 0 : _a.tagName) === "NAV"));
        },
        accepts: function (el, target) {
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
    var documentContainers = listOfColumn
        .map(function (column) {
        return column.querySelector(".documents-container");
    })
        .filter(function (container) { return container !== null; });
    documentDrake = window.dragula(documentContainers, {
        moves: function (el, container, handle) {
            return !!(el && el.classList && el.classList.contains("dragDocument"));
        },
        accepts: function (el, target) {
            var _a, _b, _c;
            var isAcolumn = (_a = target === null || target === void 0 ? void 0 : target.classList) === null || _a === void 0 ? void 0 : _a.contains("documents-container");
            var currentDocuments = (_b = target === null || target === void 0 ? void 0 : target.children) === null || _b === void 0 ? void 0 : _b.length;
            var maxDocuments = (_c = target.nextElementSibling) === null || _c === void 0 ? void 0 : _c.querySelector(".max-documents").textContent.split(" ")[1];
            if (maxDocuments === "∞") {
                maxDocuments = String(currentDocuments + 1);
            }
            return isAcolumn && currentDocuments < +maxDocuments;
        },
    });
    if (columnDrake) {
        columnDrake.on("drop", function (el, target, source) {
            if (source && source !== target) {
                source.removeChild(el);
            }
            // Update column indices after reordering
            listOfColumn = Array.from(document.querySelectorAll("div ul.dragColumn"));
            listOfColumn.forEach(function (column, index) {
                column.dataset.index = String(index);
                STATUS_BY_POSITION[index] = column.innerText.split("\n")[0];
            });
            saveToLocalStorage();
            console.log("end of List of column, drop");
        });
    }
    documentDrake.on("drop", function (el, target, source) {
        // Update document counts for both source and target columns
        if (source && target) {
            var sourceColumn = source.closest(".dragColumn");
            var targetColumn = target.closest(".dragColumn");
            if (sourceColumn) {
                updateDocumentCount(sourceColumn);
            }
            if (targetColumn && targetColumn !== sourceColumn) {
                updateDocumentCount(targetColumn);
                // Update document status based on new column
                var targetColumnIndex = parseInt(targetColumn.dataset.index || String(0));
                var newStatus = getStatusForColumn(STATUS_BY_POSITION, targetColumnIndex);
                //update analytics
                if (el.dataset.analytics) {
                    var analytics = JSON.parse(el.dataset.analytics);
                    analytics[sourceColumn.id].push(Date.now());
                    if (!analytics[targetColumn.id]) {
                        analytics[targetColumn.id] = [];
                    }
                    analytics[targetColumn.id].push(Date.now());
                    el.dataset.analytics = JSON.stringify(analytics);
                    // Update progress button appearance
                    var progressBtnTemp = el.querySelector(".progress-button");
                    if (progressBtnTemp) {
                        var drakeProgressBtn = progressBtnTemp;
                        updateProgressButtonState(drakeProgressBtn, newStatus);
                    }
                }
            }
        }
        saveToLocalStorage();
        console.log("end of documentDrake");
    });
    console.log("end of reinitializeDragula");
}
function deleteDocument(docID) {
    var _a;
    var theDoomedDocument = document.getElementById(docID);
    if (!theDoomedDocument) {
        console.warn("Document ".concat(docID, " not found for deletion. kanban.js line 509"));
        return;
    }
    if (theDoomedDocument) {
        (_a = theDoomedDocument === null || theDoomedDocument === void 0 ? void 0 : theDoomedDocument.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(theDoomedDocument);
        saveToLocalStorage();
    }
    console.log("end of deleteDocument end");
}
function edit(element) {
    var text = element.textContent;
    element.textContent = "";
    var rewrite = document.createElement("input");
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
    var _a, _b, _c, _d, _e, _f;
    var maxDocuments = (_c = (_b = (_a = document === null || document === void 0 ? void 0 : document.getElementById("".concat(columnData))) === null || _a === void 0 ? void 0 : _a.querySelector(".max-documents")) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.split(" ")[1];
    var currentDocuments = (_f = (_e = (_d = document === null || document === void 0 ? void 0 : document.getElementById("".concat(columnData))) === null || _d === void 0 ? void 0 : _d.querySelector(".document-count")) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.split(" ")[1];
    if (maxDocuments && currentDocuments && +maxDocuments <= +currentDocuments) {
        alert("Max document limit reached");
        return;
    }
    // else {
    //   throw new Error(
    //     "404 Couldn't find MaxDocuments or CurrentDocuments, kanban.js line 880"
    //   );
    // }
    var theDocPopupFormTemp = document.getElementById("createDocumentForm");
    if (!(theDocPopupFormTemp instanceof HTMLElement)) {
        throw new Error("404 Couldn't find #createDocumentForm, kanban.js line 884");
    }
    var theDocPopupForm = theDocPopupFormTemp;
    var backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
    backdrop.style.display = "block";
    theDocPopupForm.style.display = "block";
    document.body.classList.add("modal-open");
    // const assigneeButton = document.getElementById("documentAssignee")
    // assigneeButton
    // adminList()
    var popupButtonTemp = document.getElementById("createDoc");
    if (!(popupButtonTemp instanceof HTMLElement)) {
        throw new Error("404 Couldn't find #createDoc, kanban.js line 900");
    }
    var popupButton = popupButtonTemp;
    popupButton.setAttribute("data-id", columnData);
    var documentTitle = document.getElementById("documentTitle");
    if (documentTitle !== null) {
        documentTitle === null || documentTitle === void 0 ? void 0 : documentTitle.focus();
    }
    console.log("end of createDocumentPopup");
}
function init(emittedBoard, emitted) {
    var _a;
    var _b;
    if (emittedBoard === void 0) { emittedBoard = null; }
    if (emitted === void 0) { emitted = false; }
    var createColumnForm = document.getElementById("createColumnForm");
    // if (!createColumnForm) {
    //   throw new Error("404 Couldn't find #createColumnForm");
    // }
    var createDocumentForm = document.getElementById("createDocumentForm");
    if (!createDocumentForm) {
        throw new Error("404 Couldn't find #createDocumentForm");
    }
    var filterDocumentForm = document.getElementById("filterDocumentForm");
    if (!filterDocumentForm) {
        throw new Error("404 Couldn't find #filterDocumentForm");
    }
    var dragparent = document.getElementById("dragparent");
    console.log("init started");
    // Load saved data first
    loadFromLocalStorage(emittedBoard, emitted);
    if (dragparent instanceof HTMLElement) {
        var test = dragparent;
        if (test.hasChildNodes() && isAdmin) {
            reinitializeDragula(test, listOfColumn);
            // Handle the drop event for columns
            if (columnDrake !== undefined) {
                columnDrake.on("drop", function (el, target, source) {
                    if (source && source !== target) {
                        source.removeChild(el); // Remove the original column from the source
                    }
                    // Update column indices after reordering
                    var columns = Array.from(document.querySelectorAll(".dragColumn"));
                    columns.forEach(function (columnParmeter, index) {
                        var column = columnParmeter;
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
        createColumnForm === null || createColumnForm === void 0 ? void 0 : createColumnForm.removeEventListener("submit", handleColumnSubmit);
        createColumnForm === null || createColumnForm === void 0 ? void 0 : createColumnForm.addEventListener("submit", handleColumnSubmit);
    }
    // Always attach submit handler so event.preventDefault() prevents reload
    if (filterDocumentForm !== null) {
        filterDocumentForm.removeEventListener("submit", setDocumentFilter);
        filterDocumentForm.addEventListener("submit", setDocumentFilter);
    }
    function handleColumnSubmit(event) {
        return __awaiter(this, void 0, void 0, function () {
            var columnContent, maxDocuments, column, newColumn, dragparent, modalTemp, modal, STATUS_BY_POSITION, documentContainers;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        event.preventDefault();
                        columnContent = (_a = document.getElementById("columnContent")) === null || _a === void 0 ? void 0 : _a.value;
                        maxDocuments = document.getElementById("maxDocuments").value ||
                            "∞";
                        if (maxDocuments === "0")
                            maxDocuments = "∞";
                        column = {
                            id: "column-".concat(Date.now()),
                            title: columnContent,
                            backgroundColor: "#f9f9f9",
                            documents: [],
                            index: String(listOfColumn.length),
                            maxDocuments: maxDocuments,
                        };
                        return [4 /*yield*/, createColumnFromSaved(column)];
                    case 1:
                        newColumn = _b.sent();
                        dragparent = document.getElementById("dragparent");
                        if (!dragparent) {
                            throw new Error("404 Couldn't find the Column from DB");
                        }
                        dragparent.appendChild(newColumn);
                        listOfColumn.push(newColumn);
                        modalTemp = document.querySelector(".modalWrapper");
                        if (!modalTemp) {
                            throw new Error("404 Couldn't find the class modalWrapper");
                        }
                        modal = modalTemp;
                        modal.style.display = "none";
                        // if (!createColumnForm) {
                        //   throw new Error("404 CreateColumnForm was null");
                        // }
                        createDocumentForm.reset();
                        saveToLocalStorage();
                        STATUS_BY_POSITION = setStateList().status;
                        // Reinitialize dragula for documents with new column
                        documentDrake.destroy();
                        listOfColumn = Array.from(document.querySelectorAll(".dragColumn"));
                        documentContainers = listOfColumn
                            .map(function (column) { return column.querySelector(".documents-container"); })
                            .filter(function (container) { return container !== null; });
                        documentDrake = window.dragula(documentContainers, {
                            moves: function (el, container, handle) {
                                return !!(el && el.classList.contains("dragDocument"));
                            },
                            accepts: function (el, target) {
                                return !!(target && target.classList.contains("documents-container"));
                            },
                        });
                        documentDrake.on("drop", function (el, target, source) {
                            if (source && source !== target) {
                                // Update any necessary data or references for this document
                                el.dataset.status = target.parentElement.innerText.split("\n")[0];
                            }
                            saveToLocalStorage();
                        });
                        return [2 /*return*/];
                }
            });
        });
    }
    if (!createDocumentForm) {
        throw new Error("404 Couldn't find createDocumentForm");
    }
    var form = createDocumentForm;
    form.removeEventListener("submit", handleDocumentSubmit);
    form.addEventListener("submit", handleDocumentSubmit);
    function handleDocumentSubmit(event) {
        var _a, _b;
        var _c, _d, _e, _f, _g;
        event.preventDefault();
        var columnID = (_c = document === null || document === void 0 ? void 0 : document.getElementById("createDoc")) === null || _c === void 0 ? void 0 : _c.dataset.id;
        if (!columnID) {
            throw new Error("404 Couldn't find the #createDoc element, kanban.js ~1036");
        }
        var parentColumn = document.getElementById(columnID);
        // Get column index for status
        var columnIndex = parseInt(((_d = parentColumn === null || parentColumn === void 0 ? void 0 : parentColumn.dataset) === null || _d === void 0 ? void 0 : _d.index) || String(0));
        if (STATUS_BY_POSITION.length === 0) {
            (_a = setStateList(), STATUS_BY_POSITION = _a.status, listOfColumn = _a.listOfColumn);
        }
        var status = getStatusForColumn(STATUS_BY_POSITION, columnIndex);
        var title = (_e = document.getElementById("documentTitle").value) !== null && _e !== void 0 ? _e : "Double click to add a Title";
        var description = (_g = (_f = document.getElementById("documentDescription")) === null || _f === void 0 ? void 0 : _f.value) !== null && _g !== void 0 ? _g : "Description:";
        if (description !== null) {
            description = description;
        }
        var doc = {
            id: "doc-".concat(Date.now()),
            title: title,
            description: description,
            backgroundColor: "#08CF65",
            status: status,
            assignee: document.getElementById("documentAssignee")
                .value || "Unassigned",
            labels: Array.from(document.getElementById("documentLabel").value.split(" ")) || [],
            blocked: false,
            columnLifeTime: (_b = {}, _b[columnID] = [Date.now()], _b),
            blockTimeStamp: [],
        };
        var documentLineItem = createDocumentFromSaved(doc, columnIndex);
        var documentsContainer = parentColumn === null || parentColumn === void 0 ? void 0 : parentColumn.querySelector(".documents-container");
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
        var backdrop = document.querySelector(".modal-backdrop");
        if (backdrop)
            backdrop.remove();
        document.body.classList.remove("modal-open");
        saveToLocalStorage();
    }
    // Close button for document form
    var closeBtn = document.querySelector(".close-btn");
    if (!closeBtn) {
        throw new Error("404 Couldn't find closeBtn, Kanban.js ~1089");
    }
    closeBtn.addEventListener("click", function () {
        createDocumentForm.style.display = "none";
        var backdrop = document.querySelector(".modal-backdrop");
        if (backdrop)
            backdrop.remove();
        document.body.classList.remove("modal-open");
    });
    var clear = document.getElementById("clearFilters");
    if (clear) {
        (_b = document
            .getElementById("clearFilters")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function (event) {
            event.preventDefault();
            // setStateList()
            document
                .querySelectorAll(".dragDocument")
                .forEach(function (li) { return (li.style.display = "flex"); });
            document.querySelector("div:has(#filterDocumentForm)").style.display = "none";
        });
    }
    console.log("end of init");
    (_a = setStateList(), STATUS_BY_POSITION = _a.status, listOfColumn = _a.listOfColumn);
}
// Add event listener for page unload
window.addEventListener("beforeunload", function (event) {
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
function getUserId() {
    return __awaiter(this, void 0, void 0, function () {
        var response, userId, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/profile/getId")];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    userId = _a.sent();
                    return [2 /*return*/, userId];
                case 3:
                    error_3 = _a.sent();
                    console.error("".concat(error_3, " Couldn't find the user's ID"));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Initialize socket connection
socket.on("connect", function () { return __awaiter(void 0, void 0, void 0, function () {
    var userId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Connected to server");
                return [4 /*yield*/, getUserId()];
            case 1:
                userId = _a.sent();
                socket.emit("join-room", "kanban".concat(projectId), userId);
                return [2 /*return*/];
        }
    });
}); });
if (!socket.connected) {
    console.log("Socket not connected — connecting now...");
    socket.connect();
    var userId = await getUserId();
    socket.emit("join-room", "kanban".concat(projectId), userId);
}
else {
    console.log("Socket already connected.");
    var userId = await getUserId();
    socket.emit("join-room", "kanban".concat(projectId), userId);
}
socket.on("board-updated", function (updatedBoard) {
    console.log("Received board update:", updatedBoard);
    if (updatedBoard && updatedBoard.projectId === projectId) {
        loadFromLocalStorage(updatedBoard, true);
    }
});
socket.on("disconnect", function () {
    console.warn("Lost connection! Retrying in 5 seconds...");
    setTimeout(function () {
        socket.connect(); // Attempt reconnect
    }, 5000);
});
function setDocumentFilter(event) {
    return __awaiter(this, void 0, void 0, function () {
        var listOfColumn, assignee, labels, filterTitle, filterWord, filteredCriterion, documentList, filterModal;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            event.preventDefault();
            listOfColumn = setStateList().listOfColumn;
            document
                .querySelectorAll("li")
                .forEach(function (li) { return (li.style.display = "flex"); });
            assignee = (_a = document.getElementById("filterAssignee").value
                .toLowerCase()
                .trim()) !== null && _a !== void 0 ? _a : "";
            labels = (_b = document.getElementById("filterLabel").value
                .toLowerCase()
                .trim()
                .split(" ")) !== null && _b !== void 0 ? _b : [""];
            filterTitle = (_c = document.getElementById("filterTitle").value
                .toLowerCase()
                .trim()) !== null && _c !== void 0 ? _c : "";
            filterWord = (_d = document.getElementById("filterWord").value
                .toLowerCase()
                .trim()) !== null && _d !== void 0 ? _d : "";
            filteredCriterion = [assignee, labels, filterTitle, filterWord];
            if (listOfColumn.length > 0) {
                setStateList();
            }
            documentList = listOfColumn.flatMap(function (ul) {
                var tempList = [];
                if (assignee) {
                    tempList.push(Array.from(ul.querySelectorAll(".dragDocument")).filter(function (el) { var _a; return (_a = el === null || el === void 0 ? void 0 : el.textContent) === null || _a === void 0 ? void 0 : _a.includes("Assignee:".concat(assignee)); }));
                }
                if (!(labels.length === 1 && labels[0] === "")) {
                    tempList.push(listOfColumn.flatMap(function (ul) {
                        var anArray = Array.from(ul.querySelectorAll(".dragDocument"));
                        var anotherArray = anArray.filter(function (li) {
                            if (li && li.textContent) {
                                var liContent_1 = li.textContent
                                    .toLowerCase()
                                    .split("labels:")[1]
                                    .trim()
                                    .split(" ");
                                var truth = labels.every(function (label) { return liContent_1.includes(label); });
                                return !!truth;
                            }
                        });
                        return anotherArray;
                    }));
                }
                if (filterTitle) {
                    tempList.push(listOfColumn.flatMap(function (ul) {
                        var anArray = Array.from(ul.querySelectorAll(".dragDocument"));
                        var anotherArray = anArray.filter(function (li) {
                            if (li && li.textContent) {
                                var liContent = li.textContent
                                    .toLowerCase()
                                    .trim()
                                    .split("description:")[0];
                                var truth = liContent.includes(filterTitle);
                                return !!truth;
                            }
                        });
                        return anotherArray;
                    }));
                }
                if (filterWord) {
                    tempList.push(listOfColumn.flatMap(function (ul) {
                        return Array.from(ul.querySelectorAll(".dragDocument")).filter(function (li) {
                            if (li && li.textContent) {
                                var liContent = li.textContent
                                    .toLowerCase()
                                    .replace("description:", " ")
                                    .replace("assignee:", " ")
                                    .replace("labels:", " ");
                                var truth = liContent.includes(filterWord);
                                return !!truth;
                            }
                        });
                    }));
                }
                return tempList.flat();
            });
            documentList.forEach(function (li) { return (li.style.display = "none"); });
            filterModal = document.querySelector(".modal.modalWrapper");
            if (filterModal)
                filterModal.style.display = "none";
            return [2 /*return*/];
        });
    });
}
