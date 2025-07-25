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
        this.cfdChart = document.getElementById('cfdChart');
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
            ;
            this.kanbanData = await response.json();
            // if (this.kanbanData){
            //   let test = this.kanbanData.columns as object[] 
            //   let docs:Array<ColumnNameMap> =[]
            //   test.forEach((columnn ) =>{
            //     let column =columnn as Column;
            //     if ( Array.isArray(column.documents) && (column as Column).documents.length > 0){
            //       (column as Column).documents.forEach((document)=>{
            //         docs.push( (document as Docu_ment).columnLifeTime)
            //       })
            //     }
            //   })
            // console.log(" Kanban data was fetched successfully, projectTemplate.loadInitialData")
            // }
        }
        catch (error) {
            console.error(`Couldn't get kanbanData from server: ${error instanceof Error ? error.message : error}, projectTemplate loadInitialData()`);
        }
    }
    async parseCFDdata(rawdata) {
        // if (`${typeof rawdata}` === "KanbanData"){
        let columnArray = rawdata.columns;
        let docsArray = [];
        const cfdColumnTitles = columnArray.map((column, i, a) => column.title);
        // this.cfdLabels =  this will egual oldest dat and news dat and ...5? spaced between them 
        // We need to grab the column life spans from each document, including their dates
        columnArray.forEach((column) => {
            if (column.documents.length > 0) {
                docsArray.push(...column.documents.flat());
            }
            ;
        }); //docsArray.
        //get and array of the objects column name: time in ms
        let columnLifeTimeArray = docsArray.map((aDocument) => aDocument.columnLifeTime);
        let columnLifeTimeMap = new Map();
        let ColumnNamesSet = new Set();
        columnLifeTimeArray.forEach((lifetimeArray) => {
            Object.entries(lifetimeArray).forEach(([columnName, timestamps]) => {
                timestamps.forEach((time, i) => {
                    const addORSubtract = i % 2 === 0 ? 1 : -1;
                    const currentMap = columnLifeTimeMap.get(columnName) ?? {};
                    currentMap[time] = addORSubtract;
                    columnLifeTimeMap.set(columnName, currentMap);
                });
            });
        });
        ;
        // moment().format("MMM Do)
        //      if (typeof this.cfdChart === HTMLCanvasElement){
        //   const myChart:Chart = new Chart(
        //     this.cfdChart as HTMLCanvasElement,
        //   cfdConfig
        //   )
        // };
        // const cfdConfig:ChartConfiguration ={
        //   type: 'line',
        //   // data: {
        //   //   Labels: this.cfdLabels,
        //   //   datasets: [...this.cfdData as ChartData],
        //   // },
        //   data: {
        //   labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        //   datasets: [{
        //     label: '# of Votes',
        //     data: [12, 19, 3, 5, 2, 3],
        //     borderWidth: 1
        //   }],
        //   options: {
        //     scales: {
        //       y: {
        //         beginAtZero: true
        //       }
        //     },
        //     plugins: {
        //       colors: {
        //         forceOverride: true
        //       },
        //     },
        //   },
        // render init block
        //  const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        if (this.cfdChart) {
            new Chart(this.cfdChart, {
                type: 'line',
                data: {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [
                        {
                            label: 'Team Alpha',
                            data: [12, 19, 3, 5, 2, 3],
                            fill: 'origin',
                            backgroundColor: 'rgba(151, 151, 151, 1)',
                            borderColor: 'rgb(255, 99, 132)',
                            pointBackgroundColor: 'rgb(255, 99, 132)',
                        },
                        {
                            label: 'Team Alpha',
                            data: [1, 1, 1, 1, 1, 1],
                            fill: 'origin',
                            backgroundColor: 'rgba(47, 235, 91, 1)',
                            borderColor: 'rgb(47, 235, 91)',
                            pointBackgroundColor: 'rgb(47, 235, 91)',
                        }, // 4: fill to dataset 2
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: true,
                        }
                    },
                    plugins: {
                        // filler: {
                        //   propagate: true
                        // },
                        colorschemes: {
                            scheme: 'brewer.Reds7',
                            fillAlpha: 1.0
                        },
                        //   colors: {
                        //     enabled:true,
                        //     forceOverride: true
                        //   },
                    }
                }
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
    ;
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
    ;
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
    ;
}
//label project as a ProjectUI class, type annotation I realized the the project wasn't global.
let project;
class CFD_ChartElement {
    label;
    data;
    fill;
    rawData;
    constructor(paramData, paramLabel) {
        this.rawData = paramData;
        this.label = paramLabel;
        this.fill = true;
    }
    create() {
        return {
            label: this.label,
            data: this.rawData,
            fill: true,
        };
    }
}
document.addEventListener("DOMContentLoaded", () => {
    //create the instance Of the project after the DOM is loaded so everything can get initialized correctly
    project = new ProjectUI();
});
