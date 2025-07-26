"use strict";
console.log("projectTemplate script is loaded");
// --- Constants ---
// Centralize selectors to avoid magic strings and improve maintainability
const SELECTORS = {
    MODAL_WRAPPER: ".modalWrapper",
    ADD_USER_MODAL_TRIGGER: "addUserModalTrigger",
    AGILE_NAV: "ButtonsVisability",
    BURNUP_TOGGLE: "burnupVisability",
    CFD_TOGGLE: "cfdVisability",
    TAG_TOGGLE: "tagVisability",
    CLOSE_BUTTONS: ".close",
    BURNUP_SECTION: "burnupSection",
    CFD_SECTION: "cfdSection",
    TAG_SECTION: "tagSection",
};
class ProjectUI {
    // Type the variables
    modal = null;
    addUserbutton = null;
    closeSpan = null;
    agileNav = null;
    burnupToggle = null;
    cfdToggle = null;
    tagToggle = null;
    cfdChart = null;
    cfdLabels = undefined;
    currentUrl;
    currentProjectId = null;
    burnupSection = null;
    tagSection = null;
    cfdSection = null;
    kanbanData = null;
    cfdData = null; // or define your own type/interface if you want
    constructor() {
        this.currentUrl = window.location.href;
        this.init(); // Trigger the initiation of the elements.
        // this.addEventListeners();
        // this.loadInitialData();
        // this.parseCFDdata(this.kanbanData as KanbanData)
    }
    async init() {
        // Initiate the variables for the elements to be used throughout this class.
        this.modal = document.querySelector(".modalWrapper");
        this.addUserbutton = document.getElementById("addUserModalTrigger");
        this.agileNav = document.getElementById("ButtonsVisability");
        this.burnupToggle = document.getElementById("burnupVisability");
        this.cfdToggle = document.getElementById("cfdVisability");
        this.tagToggle = this.getHTMLElement("tagVisability", "TAG Toggle");
        this.closeSpan = Array.from(document.getElementsByClassName("close"));
        this.burnupSection = document.getElementById("burnupSection");
        this.cfdSection = document.getElementById("cfdSection");
        this.tagSection = document.getElementById("tagSection");
        this.cfdChart = document.getElementById("cfdChart");
        this.currentProjectId =
            this.currentUrl.split("/project/")[1]?.split("?")[0] ?? null;
        this.addEventListeners();
        await this.loadInitialData();
        this.parseCFDdata(this.kanbanData);
    }
    /**
     * A reusable method to get an HTML element and provide a warning if not found.
     * @param selector The CSS selector for the element.
     * @param name A descriptive name for the element, used in warnings.
     * @returns The found HTML element or null if not found.
     */
    getHTMLElement(selector, name) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Warning: UI element "${name}" (selector: "${selector}") not found.`);
        }
        return element;
    }
    /**
     * Add the Event listeners for the UI elements
     */
    addEventListeners() {
        this.burnupToggle?.addEventListener("click", () => this.showSection(this.burnupSection, "burnup Toggle"));
        this.cfdToggle?.addEventListener("click", () => this.showSection(this.cfdSection, "cfd Toggle"));
        this.tagToggle?.addEventListener("click", () => this.showSection(this.tagSection, "TAG Toggle"));
        this.closeSpan?.forEach((element) => element?.addEventListener("click", (e) => this.showAgileNav(e)));
        this.addUserbutton?.addEventListener("click", (e) => this.showAddUserModal(e));
    }
    /**
     * Hides the agile NAV bar
     */
    hideNav() {
        if (this.agileNav instanceof HTMLFieldSetElement) {
            this.agileNav.style.display = "none";
        }
    }
    /**
     * The function shows the figure that I want to see and closes the NAV
     * @param selector  The CSS selector for the element
     * @param name A descriptive name for the element used in the warning
     */
    showSection(selector, name) {
        if (!selector) {
            console.warn(`Warning: UI element "${name}" not found.`);
        }
        else {
            selector.style.display = "flex";
            if (this.agileNav instanceof HTMLFieldSetElement) {
                this.agileNav.style.display = "none";
            }
        }
    }
    /**
     * Fetches the Kanban data to be used in the figures
     *
     */
    async loadInitialData() {
        try {
            if (!this.currentProjectId) {
                console.warn("ProjectId is missing.");
                return undefined;
            }
            const response = await fetch(`/project/kanban/${this.currentProjectId}/data`);
            if (!response.ok) {
                console.warn(" Project ID is missing.");
            }
            this.kanbanData = await response.json();
        }
        catch (error) {
            console.error(`Couldn't get kanbanData from server: ${error instanceof Error ? error.message : error}, projectTemplate loadInitialData()`);
        }
    }
    async parseCFDdata(rawdata) {
        let dataParcer = new CFD_ChartElement(rawdata);
        let CFDdata = dataParcer.create();
        console.dir(CFDdata);
        console.log(CFDdata);
        if (this.cfdChart) {
            new Chart(this.cfdChart, {
                type: "line",
                data: {
                    datasets: CFDdata,
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: true,
                            min: 0,
                            ticks: {
                                stepSize: 1,
                            },
                        },
                        x: {
                            type: "time",
                            ticks: {
                                source: "data",
                            },
                            time: {
                                displayFormats: {
                                    quarter: "MMM Do",
                                },
                            },
                        },
                    },
                    plugins: {
                        // filler: {
                        //   propagate: true
                        // },
                        colorschemes: {
                            scheme: "brewer.Reds7",
                            fillAlpha: 1.0,
                        },
                    },
                },
            });
        }
    }
    // The public methods
    /**
     * Show the ADD user modal
     * @param event
     */
    showAddUserModal(event) {
        if (this.modal) {
            this.modal.style.display = "block";
        }
    }
    /**
     * This will open the burn figure and close the NAV bar
     * @param event
     */
    showBurnup(event) {
        if (this.burnupSection instanceof HTMLElement) {
            this.burnupSection.style.display = "flex";
            this.hideNav();
        }
    }
    /**
     * this will show the CFD figure enclosed the NAV bar
     * @param event
     */
    async showCFD(event) {
        if (this.cfdSection instanceof HTMLElement) {
            this.cfdSection.style.display = "flex";
            this.hideNav();
        }
    }
    /**
     * This will show the TAG figure and close the NAV bar
     * @param event
     */
    showTAG(event) {
        if (this.tagSection instanceof HTMLElement) {
            this.tagSection.style.display = "flex";
            this.hideNav();
        }
    }
    /**
     * This will close any of the figures that are open and open the NAV bar
     * @param event
     */
    showAgileNav(event) {
        if (this.tagSection instanceof HTMLElement) {
            this.tagSection.style.display = "none";
        }
        if (this.cfdSection instanceof HTMLElement) {
            this.cfdSection.style.display = "none";
        }
        if (this.burnupSection instanceof HTMLElement) {
            this.burnupSection.style.display = "none";
        }
        if (this.agileNav instanceof HTMLFieldSetElement) {
            this.agileNav.style.display = "flex";
        }
    }
}
//label project as a ProjectUI class, type annotation I realized the the project wasn't global.
let project;
/**
 * Class responsible for transforming Kanban lifecycle data into Chart.js-ready datasets for CFD visualization.
 */
class CFD_ChartElement {
    /** Optional display label for the chart */
    label;
    /** Optional raw Chart.js data structure (unused directly in this flow) */
    data;
    /** Fill style used in the chart (usually 'origin' for stacked area effect) */
    fill;
    /** Full raw input Kanban data */
    rawData;
    /** List of Kanban columns extracted from the raw data */
    columnArray;
    /** Flattened list of all documents present in the columns */
    docsArray;
    /**
     * Maps each column ID to a record of timestamp ➝ +1/-1 values.
     * Used to track entry/exit lifecycle deltas.
     */
    columnLifeTimeMap;
    /** Array of columnLifeTime objects extracted per document */
    columnLifeTimeArray;
    /** Final dataset array to be passed into Chart.js */
    dataSet;
    /**
     * Initializes the parser with Kanban data.
     * @param paramData Raw Kanban structure containing columns and documents
     */
    constructor(paramData) {
        this.rawData = paramData;
        this.label = "";
        this.fill = true;
        this.columnArray = this.rawData.columns;
        this.docsArray = [];
        this.columnLifeTimeMap = new Map();
        this.columnLifeTimeArray = null;
        this.dataSet = [];
    }
    /**
     * Entry point to generate chart datasets.
     * Extracts documents, lifetimes, and builds cumulative flow data.
     * @returns Array of Chart.js dataset objects
     */
    create() {
        this.getDocumentArray();
        this.getColumnLifeTimeArray();
        this.getlifeTimeMap();
        return this.getDateSet();
    }
    /**
     * Gathers all documents across columns and flattens them into a single list.
     */
    getDocumentArray() {
        this.columnArray.forEach((column) => {
            if (column.documents.length > 0) {
                this.docsArray.push(...column.documents.flat());
            }
        });
    }
    /**
     * Extracts the columnLifeTime mapping from each document.
     */
    getColumnLifeTimeArray() {
        this.columnLifeTimeArray = this.docsArray.map((aDocument) => aDocument.columnLifeTime);
    }
    /**
     * Builds a Map of column lifecycle deltas.
     * +1 for entry, -1 for exit based on timestamp order.
     */
    getlifeTimeMap() {
        if (this.columnLifeTimeArray) {
            this.columnLifeTimeArray.forEach((lifetimeArray) => {
                Object.entries(lifetimeArray).forEach(([columnName, timestamps]) => {
                    timestamps.forEach((time, i) => {
                        const addORSubtract = i % 2 === 0 ? 1 : -1;
                        const currentMap = this.columnLifeTimeMap.get(columnName) ?? {};
                        currentMap[time] = addORSubtract;
                        this.columnLifeTimeMap.set(columnName, currentMap);
                    });
                });
            });
        }
    }
    /**
     * Converts lifecycle deltas into cumulative flow datasets.
     * Each column gets a line showing cumulative document count over time.
     * @returns Array of Chart.js dataset objects
     */
    getDateSet() {
        //using a set to exclude duplicates
        const allTimestampsSet = new Set();
        // Collect all timestamps from all columns to be able to add up the values to stack. in milliseconds
        this.columnLifeTimeMap.forEach((timeMap) => {
            Object.keys(timeMap).forEach((t) => allTimestampsSet.add(Number(t)));
        });
        // Sort all unique timestamps because they were in order or some reason
        const allTimestamps = Array.from(allTimestampsSet).sort((a, b) => a - b);
        const datasets = [];
        // For each column, create a cumulative Y array
        this.columnLifeTimeMap.forEach((timeMap, columnId) => {
            const labelColumn = this.rawData?.columns.find((column) => column.id === columnId);
            const label = labelColumn?.title || columnId; // grab the title
            // for stacking the lines.
            const dataPoints = [];
            let cumulative = 0;
            //loop through all the x points(allTimestamps) if the column(timeMap) changes at one(t)  make the change, else don't.
            // this adds ALL the x point to each column.
            for (const t of allTimestamps) {
                if (timeMap[t] !== undefined) {
                    cumulative += timeMap[t];
                }
                dataPoints.push({ x: t, y: cumulative });
            }
            // Force start at 0 and extend last point
            dataPoints.unshift({ x: allTimestamps[0], y: 0 });
            dataPoints.push({
                x: allTimestamps[allTimestamps.length - 1] + 1,
                y: cumulative,
            });
            datasets.push({
                label,
                data: dataPoints,
                fill: "origin",
            });
        });
        return datasets;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    //create the instance Of the project after the DOM is loaded so everything can get initialized correctly
    project = new ProjectUI();
});
