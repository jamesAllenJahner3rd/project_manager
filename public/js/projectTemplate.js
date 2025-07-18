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
    currentUrl;
    currentProjectId = null;
    burnupSection = null;
    tagSection = null;
    cfdSection = null;
    kanbanData = null;
    constructor() {
        this.currentUrl = window.location.href;
        this.init(); // Trigger the initiation of the elements.
        this.addEventListeners();
        this.loadInitialData();
    }
    init() {
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
        this.currentProjectId =
            this.currentUrl.split("/project/")[1]?.split("?")[0] ?? null;
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
            ;
            this.kanbanData = await response.json();
            console.log(" Kanban data was fetched successfully, projectTemplate.loadInitialData");
        }
        catch (error) {
            console.error(`Couldn't get kanbanData from server: ${error instanceof Error ? error.message : error}, projectTemplate loadInitialData()`);
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
const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
            label: 'Weekly Sales',
            data: [1, 1, 2, 2, 3, 3, 4],
            backgroundColor: [
                'rgba(255, 26, 104, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1 )',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(0, 0, 0, 0.2)'
            ],
            borderColor: [
                'rgba(255, 26, 104, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(0, 0, 0, 1)'
            ],
            borderWidth: 1,
            fill: true,
        }, {
            label: 'monthly Sales',
            data: [0, 2, 3, 3, 4, 5, 6],
            backgroundColor: [
                'rgba(255, 26, 104, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1 )',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(0, 0, 0, 0.2)'
            ],
            borderColor: [
                'rgba(255, 26, 104, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(0, 0, 0, 1)'
            ],
            borderWidth: 1,
            fill: true,
        }]
};
// config 
const config = {
    type: 'line',
    data,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};
// render init block
if (document.getElementById('myChart') instanceof Chart) {
    const myChart = new Chart(document.getElementById('myChart'), config);
}
// Instantly assign Chart.js version
// const chartVersion: = document.getElementById('chartVersion');
// chartVersion.innerText = myChart.version;
document.addEventListener("DOMContentLoaded", () => {
    //create the instance Of the project after the DOM is loaded so everything can get initialized correctly
    project = new ProjectUI();
});
