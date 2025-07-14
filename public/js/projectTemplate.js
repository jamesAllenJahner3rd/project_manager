"use strict";
console.log("projectTemplate script is loaded");
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
    constructor() {
        this.currentUrl = window.location.href;
        this.init(); // Trigger the initiation of the elements.
        this.addEventListeners();
    }
    init() {
        // Initiate the variables for the elements to be used throughout this class.
        this.modal = document.querySelector(".modalWrapper");
        this.addUserbutton = document.getElementById("addUserModalTrigger");
        this.agileNav = document.getElementById("ButtonsVisability");
        this.burnupToggle = document.getElementById("burnupVisability");
        this.cfdToggle = document.getElementById("cfdVisability");
        this.tagToggle = document.getElementById("tagVisability");
        this.closeSpan = Array.from(document.getElementsByClassName("close"));
        this.burnupSection = document.getElementById("burnupSection");
        this.cfdSection = document.getElementById("cfdSection");
        this.tagSection = document.getElementById("tagSection");
        this.currentProjectId =
            this.currentUrl.split("/project/")[1]?.split("?")[0] ?? null;
    }
    // create a resusable warning for missing elements.
    getHTMLElement(selector, name) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Warning: UI element "${name}" (selector: "${selector}") not found.`);
        }
        return element;
    }
    addEventListeners() {
        this.burnupToggle?.addEventListener("click", () => this.showSection(this.burnupSection, "burnup Toggle"));
        this.cfdToggle?.addEventListener("click", () => this.showSection(this.cfdSection, "cfd Toggle"));
        this.tagToggle?.addEventListener("click", () => this.showSection(this.tagSection, "TAG Toggle"));
        this.closeSpan?.forEach((element) => element?.addEventListener("click", (e) => this.showAgileNav(e)));
        this.addUserbutton?.addEventListener("click", (e) => this.showAddUserModal(e));
    }
    hideNav() {
        if (this.agileNav instanceof HTMLFieldSetElement) {
            this.agileNav.style.display = "none";
        }
    }
    showAddUserModal(event) {
        if (this.modal) {
            this.modal.style.display = "block";
        }
    }
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
    showBurnup(event) {
        if (this.burnupSection instanceof HTMLElement) {
            this.burnupSection.style.display = "flex";
            this.hideNav();
        }
    }
    showCFD(event) {
        if (this.cfdSection instanceof HTMLElement) {
            this.cfdSection.style.display = "flex";
            this.hideNav();
        }
    }
    showTAG(event) {
        if (this.tagSection instanceof HTMLElement) {
            this.tagSection.style.display = "flex";
            this.hideNav();
        }
    }
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
document.addEventListener("DOMContentLoaded", () => {
    const project = new ProjectUI();
});
