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
    CLOSE_BUTTONS: "close",
    BURNUP_SECTION: "burnupSection",
    CFD_SECTION: "cfdSection",
    TAG_SECTION: "tagSection",
    BURNUP_CHART: "burnupChart",
    CFD_CHART: "cfdChart",
    TAG_CHART: "tagChart",
};
class ProjectUI {
  // public dataSet: ChartDataset<"line" | "bar", number[]>[];
  // Type the variables
  modal = null;
  addUserbutton = null;
  closeSpan = null;
  agileNav = null;
  burnupToggle = null;
  cfdToggle = null;
  tagToggle = null;
  cfdChart = null;
  burnupChart = null;
  tagChart = null;
  cfdLabels = undefined;
  currentUrl;
  currentProjectId = null;
  burnupSection = null;
  tagSection = null;
  cfdSection = null;
  kanbanData = null;
  oldestTask = null;
  constructor() {
    this.currentUrl = window.location.href;
    this.init(); // Trigger the initiation of the elements.
  }
  async init() {
    // Initiate the variables for the elements to be used throughout this class.
    this.modal = document.querySelector(SELECTORS.MODAL_WRAPPER);
    this.addUserbutton = document.getElementById(
      SELECTORS.ADD_USER_MODAL_TRIGGER
    );
    this.agileNav = document.getElementById(SELECTORS.AGILE_NAV);
    this.burnupToggle = document.getElementById(SELECTORS.BURNUP_TOGGLE);
    this.cfdToggle = document.getElementById(SELECTORS.CFD_TOGGLE);
    this.tagToggle = document.getElementById(SELECTORS.TAG_TOGGLE);
    this.closeSpan = Array.from(
      document.getElementsByClassName(SELECTORS.CLOSE_BUTTONS)
    );
    this.cfdSection = document.getElementById(SELECTORS.CFD_SECTION);
    this.cfdChart = document.getElementById(SELECTORS.CFD_CHART);
    this.tagSection = document.getElementById(SELECTORS.TAG_SECTION);
    this.tagChart = document.getElementById(SELECTORS.TAG_CHART);
    this.burnupSection = document.getElementById(SELECTORS.BURNUP_SECTION);
    this.burnupChart = document.getElementById(SELECTORS.BURNUP_CHART);
    this.currentProjectId =
      this.currentUrl.split("/project/")[1]?.split("?")[0] ?? null;
    this.addEventListeners();
    await this.loadInitialData();
    this.parseCFDdata(this.kanbanData);
    this.parseBurnupData(this.kanbanData);
    this.parseTAGData(this.kanbanData);
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
      console.warn(
        `Warning: UI element "${name}" (selector: "${selector}") not found.`
      );
    }
    return element;
  }
  /**
   * Add the Event listeners for the UI elements
   */
  addEventListeners() {
    this.burnupToggle?.addEventListener("click", () =>
      this.showSection(this.burnupSection, "burnup Toggle")
    );
    this.cfdToggle?.addEventListener("click", () =>
      this.showSection(this.cfdSection, "cfd Toggle")
    );
    this.tagToggle?.addEventListener("click", () =>
      this.showSection(this.tagSection, "TAG Toggle")
    );
    this.closeSpan?.forEach((element) =>
      element?.addEventListener("click", (e) => this.showAgileNav(e))
    );
    this.addUserbutton?.addEventListener("click", (e) =>
      this.showAddUserModal(e)
    );
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
    } else {
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
      const response = await fetch(
        `/project/kanban/${this.currentProjectId}/data`
      );
      if (!response.ok) {
        console.warn(" Project ID is missing.");
      }
      this.kanbanData = await response.json();
    } catch (error) {
      console.error(
        `Couldn't get kanbanData from server: ${
          error instanceof Error ? error.message : error
        }, projectTemplate loadInitialData()`
      );
    }
  }
  async parseBurnupData(rawdata) {
    let dataParcer = new Burnup_ChartElement(rawdata);
    let Burnupdata = dataParcer.create();
    if (this.burnupChart) {
      new Chart(this.burnupChart, {
        type: "line",
        data: {
          datasets: Burnupdata,
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              stacked: false,
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
            colorschemes: false,
          },
        },
      });
    }
  }
  async parseCFDdata(rawdata) {
    let dataParcer = new CFD_ChartElement(rawdata);
    let CFDdata = dataParcer.create();
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
            colorschemes: {
              scheme: "brewer.Reds7",
              fillAlpha: 1.0,
            },
          },
        },
      });
    }
  }
  async parseTAGData(rawdata) {
    const dataParcer = new TAG_ChartElement(rawdata);
    const tagData = dataParcer.getDataSet().flat();
    const labels = dataParcer.getXVariables();
    const docLabels = dataParcer.getDocumentTitlesArray();
    const percentiles = dataParcer.getPercentiles();
    const columnPercentiles = dataParcer.perColumnPercents();
    this.oldestTask = dataParcer.firstTaskEver;
    if (this.tagChart) {
      new Chart(this.tagChart, {
        data: {
          labels,
          datasets: [
            {
              type: "scatter",
              label: "Aging Work In Progress",
              data: tagData,
              backgroundColor: "rgb(0,0,0)",
              datalabels: { display: false },
            },
            {
              type: "line",
              borderDash: [5, 5],
              radius: 0,
              label: "50%",
              data: [
                { x: -99, y: percentiles[0] },
                { x: 2, y: percentiles[0] },
                { x: 99, y: percentiles[0] },
              ],
              backgroundColor: "rgba(255, 255, 255, 0)",
              borderColor: "rgb(0, 0, 0)",
              datalabels: {
                formatter: function (value, context) {
                  return "50%";
                },
                display: "auto",
                anchor: "end",
                align: "top",
                offset: -3,
                fill: false,
              },
            },
            {
              type: "line",
              borderDash: [5, 5],
              radius: 0,
              label: "70%",
              data: [
                { x: -99, y: percentiles[1] },
                { x: 3, y: percentiles[1] },
                { x: 99, y: percentiles[1] },
              ],
              backgroundColor: "rgba(255, 255, 255, 0)",
              borderColor: "rgb(0, 0, 0)",
              datalabels: {
                formatter: function (value, context) {
                  return "70%";
                },
                display: "auto",
                anchor: "end",
                align: "bottom",
                offset: -3,
                fill: false,
              },
            },
            {
              type: "line",
              borderDash: [5, 5],
              radius: 0,
              label: "85",
              data: [
                { x: -99, y: percentiles[2] },
                { x: 2, y: percentiles[2] },
                { x: 99, y: percentiles[2] },
              ],
              backgroundColor: "rgba(255, 255, 255, 0)",
              borderColor: "rgb(0, 0, 0)",
              datalabels: {
                formatter: function (value, context) {
                  return "85%";
                },
                display: "auto",
                anchor: "end",
                align: "bottom",
                offset: -3,
                fill: false,
              },
            },
            {
              type: "line",
              borderDash: [5, 5],
              radius: 0,
              label: "95%",
              data: [
                { x: -99, y: percentiles[3] },
                { x: 3, y: percentiles[3] },
                { x: 99, y: percentiles[3] },
              ],
              backgroundColor: "rgba(255, 255, 255, 0)",
              borderColor: "rgb(0, 0, 0)",
              datalabels: {
                formatter: function (value, context) {
                  return "95%";
                },
                display: true,
                anchor: "end",
                align: "bottom",
                offset: -3,
                fill: false,
              },
              legend: { hidden: true },
            },
            {
              type: "bar",
              label: "0-49",
              data: columnPercentiles[0],
              backgroundColor: "rgba(0, 255, 127, .4)",
              borderSkipped: true,
              categoryPercentage: 1,
              barPercentage: 1,
              stack: "columns",
              datalabels: {
                display: false,
              },
              legend: { hidden: true },
            },
            {
              type: "bar",
              label: "51-70",
              data: columnPercentiles[1],
              backgroundColor: "rgba(0, 255, 0, .6)",
              borderSkipped: true,
              stack: "columns",
              categoryPercentage: 1,
              barPercentage: 1,
              datalabels: {
                display: false,
              },
              legend: { hidden: true },
            },
            {
              type: "bar",
              label: "70-84",
              data: columnPercentiles[2],
              backgroundColor: "rgba(255, 255, 0, 1)",
              borderSkipped: true,
              stack: "columns",
              categoryPercentage: 1,
              barPercentage: 1,
              datalabels: {
                display: false,
              },
              legend: { hidden: true },
            },
            {
              type: "bar",
              label: "85-94",
              data: columnPercentiles[3],
              backgroundColor: "rgba(255, 127, 0, 1)",
              borderSkipped: true,
              stack: "columns",
              categoryPercentage: 1,
              barPercentage: 1,
              datalabels: {
                display: false,
              },
              legend: { hidden: true },
            },
            {
              type: "bar",
              label: "95-100",
              data: columnPercentiles[4],
              backgroundColor: "rgba(255, 0, 0, 1)",
              borderColor: "rgb(0, 0, 0)",
              borderSkipped: true,
              stack: "columns",
              categoryPercentage: 1,
              barPercentage: 1,
              datalabels: {
                display: false,
              },
              legend: { hidden: true },
            },
          ],
        },
        options: {
          borderWidth: 1,
          responsive: true,
          scales: {
            y: {
              position: "left",
              beginAtZero: true,
              max: this.oldestTask,
              ticks: {
                color: "#000000",
              },
            },
            x: {
              offset: true,
              position: "left",
              min: 0,
              max: 3,
              type: "linear",
              display: true,
              ticks: {
                align: "center",
                stepSize: 1,
                callback: function (val, index) {
                  return labels[index] || "";
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                filter: function (item, chart) {
                  return item.text === "Aging Work In Progress";
                },
              },
            },
            colorschemes: false,
            tooltip: {
              callbacks: {
                title: function (tooltipItems) {
                  if (tooltipItems[0].dataset.type !== "bar") {
                    return (
                      `${docLabels[tooltipItems[0]?.dataIndex]}` || "Unknown"
                    );
                  }
                  return "";
                },
                label: function (context) {
                  if (context.dataset.type === "bar") {
                    return [
                      `${context.dataset.label} of task`,
                      `are completed in ${context.formattedValue} days`,
                    ];
                  }
                  if (context.dataset.type === "scatter") {
                    return [
                      `Age: ${Math.round(context.raw.y)} days`,
                      `Column: ${context.raw.x}`,
                    ];
                  }
                },
              },
              intersect: false,
            },
          },
        },
        plugins: [ChartDataLabels],
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
    this.columnArray = paramData?.columns ?? [];
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
    this.getLifeTimeMap();
    return this.getDataSet();
  }
  /**
   * Gathers all documents across columns and flattens them into a single list.
   */
  getDocumentArray() {
    this.docsArray = [];
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
    this.columnLifeTimeArray = this.docsArray.map(
      (aDocument) => aDocument.columnLifeTime
    );
  }
  /**
   * Builds a Map of column lifecycle deltas.
   * +1 for entry, -1 for exit based on timestamp order.
   */
  getLifeTimeMap() {
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
  getDataSet() {
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
      const labelColumn = this.rawData?.columns.find(
        (column) => column.id === columnId
      );
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
class Burnup_ChartElement {
  /** Optional display label for the chart */
  label;
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
    this.getLifeTimeMap();
    return this.getDataSet();
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
    this.columnLifeTimeArray = this.docsArray.map(
      (aDocument) => aDocument.columnLifeTime
    );
  }
  /**
   * Builds a Map of column lifecycle deltas.
   * +1 for entry, -1 for exit based on timestamp order.
   */
  getLifeTimeMap() {
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
   * This grabs column information and extracts the documents lifetime from the very last column.
   * Then returns the data points.
   * @returns[{x:number, y: number}]
   */
  getCompletedDocumentArray() {
    let output = [];
    let label = "";
    this.columnArray.forEach((column, i) => {
      if (column.documents.length > 0 && i === this.columnArray.length - 1) {
        label = column.title;
        output = [...column.documents.flat()].map((document) =>
          Number(document.columnLifeTime[column.id][0])
        );
        output.sort((a, b) => a - b);
      }
    });
    let data = output.map((number, i) => {
      return { x: number, y: i + 1 };
    });
    return {
      label,
      data,
      backgroundColor: "rgb(204, 65, 58)",
      borderColor: "rgb(204, 65, 58)",
    };
  }
  /**
   * Converts document infomations including column life timestamps to datasets. to Track Flow of completion versus total documents.
   * Each column gets a line showing cumulative document count over time.
   * @returns Array of Chart.js dataset objects
   */
  getDataSet() {
    // This'll be the creation times for each document.
    let docBirthTimes = [];
    // This will be the title for the last column
    let lastColumnTitle = "";
    // This will be where I gather The Times where documents have been completed
    let completedBirthTimes = [];
    // And this is going to represent X & Y data for the total of documents.
    let totalDocs = [];
    // I realized that I already had an array of all the documents.
    // And since the documents names included creation time it was the easy way to grab that.
    docBirthTimes = this.docsArray
      .map((element) => {
        return Number(element.id.split("doc-")[1]);
      })
      .sort((a, b) => a - b);
    totalDocs = docBirthTimes.map((creationTime, i) => {
      return {
        x: creationTime,
        y: i + 1,
      };
    });
    // I create another method to do this keep this more organized.
    completedBirthTimes = this.getCompletedDocumentArray();
    // But here's where I real that I didn't have a trailing data point To match the completed data set
    let sittingY = totalDocs.length;
    completedBirthTimes.data.forEach((object) => {
      totalDocs.push({ x: object.x, y: sittingY });
      totalDocs.sort((a, b) => a.x - b.x);
    });
    const datasets = [];
    datasets.push({
      label: "Total Documents",
      data: totalDocs,
      backgroundColor: "rgb(116, 27, 26)",
      borderColor: "rgb(116, 27, 26)",
    });
    datasets.push(completedBirthTimes);
    return datasets;
  }
}
/**
 * TAG_ChartElement transforms Kanban board data into visual insights using Chart.js.
 * It’s designed to reveal document flow, aging trends, and lifecycle patterns — not just to display data,
 * but to help teams understand bottlenecks and optimize throughput.
 */
/**
 * TAG_ChartElement transforms Kanban board data into visual insights using Chart.js.
 * It’s designed to reveal document flow, aging trends, and lifecycle patterns — not just to display data,
 * but to help teams understand bottlenecks and optimize throughput.
 */
class TAG_ChartElement {
  /** Label shown on the chart — useful for identifying the dataset when multiple charts are rendered. */
  label;
  /** Determines how the area under the chart is filled — 'origin' creates a stacked effect for cumulative flow. */
  fill;
  /** Stores the original Kanban data so downstream methods can trace back to source structure. */
  rawData;
  /** Extracted column definitions — used to map document flow and build axes. */
  columnArray;
  /** Flattened list of all documents — centralizing them simplifies lifecycle and aging calculations. */
  docsArray;
  /**
   * Tracks when documents enter and exit each column.
   * The +1/-1 pattern enables cumulative flow analysis by showing net document movement over time.
   */
  columnLifeTimeMap;
  /**
   * Captures each document’s journey through the board.
   * This structure is critical for understanding individual document aging and column-specific cycle times.
   */
  columnLifeTimeArray;
  /**
   * Final dataset passed to Chart.js.
   * Built to reflect document aging and flow, not just raw counts — enabling more meaningful visualizations.
   */
  dataSet;
  /**
   * Tracks the longest document cycle time.
   * Used as a baseline for percentile calculations and aging comparisons.
   */
  firstTaskEver = null;
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
   * Main entry point for dataset generation.
   * Separates chart logic from data parsing, making it easier to plug into external renderers or pipelines.
   */
  create() {
    return this.getDataSet();
  }
  /**
   * Calculates how long it takes for 50%, 70%, 85%, 95%, and 100% of documents to complete each column.
   * This helps teams identify which stages are slowing down progress — not just how long tasks take,
   * but how consistently they flow through each phase.
   */
  perColumnPercents() {
    let columnMap = new Map();
    this.columnArray.forEach((e, i) => columnMap.set(e.id, i));
    let daysPerColumnArray = Array.from({ length: columnMap.size }, () => []);
    this.columnLifeTimeArray?.forEach((doc, i, a) => {
      for (let [key, columnTemp] of Object.entries(doc)) {
        let column = columnTemp;
        if (column.length % 2 === 0) {
          for (let j = 0; j < column.length; j = j + 2) {
            let days = this.convertToDays(column[j + 1] - column[j]);
            daysPerColumnArray[columnMap.get(key)].push(days);
          }
        }
      }
    });
    const p = [50, 70, 85, 95, 100];
    let oldestDoc = 0;
    daysPerColumnArray
      .flat()
      .forEach((e) =>
        e > oldestDoc ? (oldestDoc = e) : (oldestDoc = oldestDoc)
      );
    this.firstTaskEver = oldestDoc;
    daysPerColumnArray = daysPerColumnArray.map((e) => e.sort((a, b) => a - b));
    let cDay = 0;
    let FivePercentileArrays = [
      [],
      [],
      [],
      [],
      [Array.from({ length: columnMap.size }, () => oldestDoc)],
    ];
    let memo = [[], [], [], [], []];
    let columnAging = FivePercentileArrays.map((per, i) => {
      return daysPerColumnArray.map((aArray, j, a) => {
        let perNum = per.flat() ?? 0;
        let n = aArray.length;
        let c = Math.max(0, Math.ceil((p[i] / 100) * n - 1));
        memo[i][j] = aArray[c];
        if (i - 1 >= 0) {
          const curr = perNum[j] ?? 0;
          const mem = memo[i]?.[j] ?? 0;
          const prev = memo[i - 1]?.[j] ?? 0;
          cDay = Math.abs(Math.max(mem, curr) - prev);
          memo[i][j] = cDay + prev || 0;
        } else {
          cDay = Math.max(0, memo[i][j]);
        }
        if (j === daysPerColumnArray.length - 1) {
          cDay = 0;
        }
        return { x: j, y: cDay };
      });
    });
    return columnAging;
  }
  /**
   * Finds the value at a given percentile in a sorted array.
   * Used to quantify aging trends — e.g., “How long does it take for 85% of tasks to finish?”
   */
  getPercentile(sorted, percentile) {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
  /**
   * Measures overall cycle time percentiles for completed documents.
   * Focuses on the last column to determine when tasks are truly done — filtering out partial progress.
   */
  getPercentiles() {
    const lastColumn = this.rawData?.columns.at(-1)?.id;
    if (!lastColumn) return [];
    this.getLifeTimeMap();
    this.getColumnLifeTimeArray();
    const completedList =
      this.columnLifeTimeArray?.flatMap((doc) => {
        if (!Object.hasOwn(doc, lastColumn)) return [];
        let lifeSpan = [Number.MAX_SAFE_INTEGER, 0];
        for (let column in doc) {
          doc[column].forEach((ts) => {
            lifeSpan[0] = Math.min(lifeSpan[0], ts);
            lifeSpan[1] = Math.max(lifeSpan[1], ts);
          });
        }
        return [lifeSpan];
      }) ?? [];
    const fullCycleTimes = completedList.map(([start, end]) =>
      this.convertToDays(end - start)
    );
    const sorted = fullCycleTimes.sort((a, b) => a - b);
    return [50, 70, 85, 95].map((p) => this.getPercentile(sorted, p));
  }
  /**
   * Builds a timestamp map showing when documents enter and exit each column.
   * The alternating +1/-1 pattern is intentional: it enables cumulative flow tracking by simulating net movement.
   */
  getLifeTimeMap() {
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
   * Extracts document titles for display or debugging.
   * Useful when you need to trace specific tasks through the chart or validate dataset integrity.
   */
  getDocumentArray() {
    this.columnArray.forEach((column) => {
      if (column.documents.length > 0) {
        this.docsArray.push(...column.documents.flat());
      }
    });
  }
  /**
   * Extracts document titles for display or debugging.
   * Useful when you need to trace specific tasks through the chart or validate dataset integrity.
   */
  getDocumentTitlesArray() {
    return this.docsArray.map((e) => e.title);
  }
  /**
   * Pulls lifecycle data from each document.
   * This step is crucial — it connects raw timestamps to column IDs, enabling aging and flow analysis.
   */
  getColumnLifeTimeArray() {
    this.columnLifeTimeArray = this.docsArray.map(
      (aDocument) => aDocument.columnLifeTime
    );
  }
  /**
   * Extracts column titles to use as X-axis labels.
   * These labels reflect workflow stages — not just categories, but the actual process flow.
   */
  getXVariables() {
    let xAxisTitles = this.columnArray.map((column) => column.title);
    return xAxisTitles;
  }
  /**
   * Calculates how long each document has been in its current column.
   * This reveals aging patterns — helping teams spot tasks that are stagnating or overdue.
   */
  getYAxisAges() {
    let timeStamps = this.getTimeEnteredColumn();
    return this.daysSince(timeStamps);
  }
  /**
   * Converts timestamps to age in days.
   * Normalizes data to a human-readable format — milliseconds aren’t intuitive for cycle time analysis.
   */
  daysSince(ArrayDateArray) {
    const now = Date.now();
    const output = ArrayDateArray.map((dateArray) =>
      dateArray.map((aDate) => this.convertToDays(now - aDate))
    );
    return output;
  }
  /**
   * Extracts the entry time for each document in each column.
   * Assumes the first timestamp marks entry — this simplifies aging calculations but relies on consistent data structure.
   */
  getTimeEnteredColumn() {
    const timeStampArray = this.columnArray.map((column) =>
      column.documents.map((doc) => doc.columnLifeTime[column.id][0])
    );
    return timeStampArray;
  }
  /**
   * Converts milliseconds to days.
   * Used throughout aging and percentile calculations to keep units consistent and interpretable.
   */
  convertToDays(ms) {
    return Math.floor(ms / 86400000);
  }
  /**
   * Builds the final dataset for Chart.js.
   * Each point represents a document’s age in a column — jitter is added to reduce visual overlap and improve readability.
   * The goal isn’t just to show data, but to make patterns in document aging immediately visible.
   */
  getDataSet() {
    this.getDocumentArray();
    const yAxis = this.getYAxisAges();
    const xAxis = this.getXVariables();
    let sign = -1;
    const jitter = () => {
      let a = sign * 0.05;
      sign = sign * -1;
      return a;
    };
    const data = yAxis.map((column, i) => {
      if (i !== 0 && i !== yAxis.length - 1) {
        return column.map((days) => {
          return { x: i, y: Math.abs(days) + jitter() };
        });
      } else {
        return [{ x: i, y: null }];
      }
    });
    return data;
  }
}
document.addEventListener("DOMContentLoaded", () => {
    //create the instance Of the project after the DOM is loaded so everything can get initialized correctly
    project = new ProjectUI();
});
export {};
export {};
