console.log("projectTemplate script is loaded");
import { Context } from "chartjs-plugin-datalabels";
import { ChartData as ChartJSData, ChartDataset } from "chart.js";
// Browsers do not support bare module specifiers
declare var Chart: any;
declare var ChartDataLabels: any;

type PercentilePoint = { x: number; y: number | null };
type PercentileSeries = PercentilePoint[];

type MemoMatrix = (number | null)[][];

type ChartData = ChartJSData<"line" | "bar" | "scatter", number[], string>;
type Color = string;
type ColumnName = `column-${string}`;

type ColumnNameMap = { [columnId: string]: number[] };

interface KanbanData {
  _id: string;
  projectId: string;
  columns: Column[];
}
interface KanbanDocument {
  id: string;
  title: string;
  description: string;
  backgroundColor: string;
  status: string;
  assignee: string;
  labels: string[];
  columnLifeTime: ColumnNameMap;
  blocked: boolean;
  blockTimeStamp: number[];
}
interface Column {
  id: string;
  title: string;
  backgroundColor: Color;

  documents: KanbanDocument[];
  maxKanbanDocuments: number | string;
  canAddKanbanDocuments: boolean;
  canChangeKanbanDocumentColor: boolean;
  canDeleteKanbanDocuments: boolean;
}
interface figureData {
  labels: string[] | null;
  datasets: Info[] | null;
}

interface Info {
  label: string | null;
  data: number[] | null;

  backgroundColor: string | null;
  borderColor: string[];
  borderWidth: number;
  fill: boolean;
}

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
  private modal: HTMLDivElement | null = null;
  private addUserbutton: HTMLButtonElement | null = null;
  private closeSpan: HTMLSpanElement[] | null = null;
  private agileNav: HTMLFieldSetElement | null = null;
  private burnupToggle: HTMLButtonElement | null = null;
  private cfdToggle: HTMLButtonElement | null = null;
  private tagToggle: HTMLButtonElement | null = null;
  private cfdChart: HTMLCanvasElement | null = null;
  private burnupChart: HTMLCanvasElement | null = null;
  private tagChart: HTMLCanvasElement | null = null;
  private cfdLabels: string[] | undefined = undefined;
  private currentUrl: string;

  public currentProjectId: string | null = null;

  private burnupSection: HTMLElement | null = null;
  private tagSection: HTMLElement | null = null;
  private cfdSection: HTMLElement | null = null;
  private kanbanData: KanbanData | null = null;

  private oldestTask: number | null = null;
  constructor() {
    this.currentUrl = window.location.href;
    this.init(); // Trigger the initiation of the elements.
  }
  async init(): Promise<void> {
    // Initiate the variables for the elements to be used throughout this class.
    this.modal = document.querySelector(
      SELECTORS.MODAL_WRAPPER
    ) as HTMLDivElement;
    this.addUserbutton = document.getElementById(
      SELECTORS.ADD_USER_MODAL_TRIGGER
    ) as HTMLButtonElement;
    this.agileNav = document.getElementById(
      SELECTORS.AGILE_NAV
    ) as HTMLFieldSetElement;
    this.burnupToggle = document.getElementById(
      SELECTORS.BURNUP_TOGGLE
    ) as HTMLButtonElement;
    this.cfdToggle = document.getElementById(
      SELECTORS.CFD_TOGGLE
    ) as HTMLButtonElement;
    this.tagToggle = document.getElementById(
      SELECTORS.TAG_TOGGLE
    ) as HTMLButtonElement;

    this.closeSpan = Array.from(
      document.getElementsByClassName(SELECTORS.CLOSE_BUTTONS)
    ) as HTMLSpanElement[];

    this.cfdSection = document.getElementById(
      SELECTORS.CFD_SECTION
    ) as HTMLElement;
    this.cfdChart = document.getElementById(
      SELECTORS.CFD_CHART
    ) as HTMLCanvasElement;
    this.tagSection = document.getElementById(
      SELECTORS.TAG_SECTION
    ) as HTMLElement;
    this.tagChart = document.getElementById(
      SELECTORS.TAG_CHART
    ) as HTMLCanvasElement;
    this.burnupSection = document.getElementById(
      SELECTORS.BURNUP_SECTION
    ) as HTMLElement;
    this.burnupChart = document.getElementById(
      SELECTORS.BURNUP_CHART
    ) as HTMLCanvasElement;
    this.currentProjectId =
      this.currentUrl.split("/project/")[1]?.split("?")[0] ?? null;
    this.addEventListeners();
    await this.loadInitialData();
    this.parseCFDdata(this.kanbanData as KanbanData);
    this.parseBurnupData(this.kanbanData as KanbanData);
    this.parseTAGData(this.kanbanData as KanbanData);
  }
  /**
   * A reusable method to get an HTML element and provide a warning if not found.
   * @param selector The CSS selector for the element.
   * @param name A descriptive name for the element, used in warnings.
   * @returns The found HTML element or null if not found.
   */
  private getHTMLElement<T extends HTMLElement>(
    selector: string,
    name: string
  ): T | null {
    const element = document.querySelector(selector) as T;
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
  private addEventListeners() {
    this.burnupToggle?.addEventListener("click", () =>
      this.showSection(this.burnupSection, "burnup Toggle")
    );
    this.cfdToggle?.addEventListener("click", () =>
      this.showSection(this.cfdSection, "cfd Toggle")
    );
    this.tagToggle?.addEventListener("click", () =>
      this.showSection(this.tagSection, "TAG Toggle")
    );
    this.closeSpan?.forEach((element: HTMLSpanElement) =>
      element?.addEventListener("click", (e) => this.showAgileNav(e))
    );
    this.addUserbutton?.addEventListener("click", (e) =>
      this.showAddUserModal(e)
    );
  }

  /**
   * Hides the agile NAV bar
   */
  private hideNav() {
    if (this.agileNav instanceof HTMLFieldSetElement) {
      this.agileNav.style.display = "none";
    }
  }
  /**
   * The function shows the figure that I want to see and closes the NAV
   * @param selector  The CSS selector for the element
   * @param name A descriptive name for the element used in the warning
   */
  private showSection<T extends HTMLElement>(
    selector: T | null,
    name: string
  ): void {
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
  private async loadInitialData(): Promise<void> {
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

  private async parseBurnupData(rawdata: KanbanData) {
    let dataParcer = new Burnup_ChartElement(rawdata);
    let Burnupdata: any = dataParcer.create();

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
  private async parseCFDdata(rawdata: KanbanData) {
    let dataParcer = new CFD_ChartElement(rawdata);
    let CFDdata: any = dataParcer.create();

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

  private async parseTAGData(rawdata: KanbanData) {
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
                formatter: function (value: number, context: Context) {
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
                formatter: function (value: number, context: Context) {
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
                formatter: function (value: number, context: Context) {
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
                formatter: function (value: number, context: Context) {
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
                callback: function (val: number, index: number) {
                  return labels[index] || "";
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                filter: function (item: any, chart: any) {
                  return item.text === "Aging Work In Progress";
                },
              },
            },

            colorschemes: false,
            tooltip: {
              callbacks: {
                title: function (tooltipItems: any) {
                  if (tooltipItems[0].dataset.type !== "bar") {
                    return (
                      `${docLabels[tooltipItems[0]?.dataIndex]}` || "Unknown"
                    );
                  }
                  return "";
                },
                label: function (context: any) {
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
  public showAddUserModal(event: MouseEvent) {
    if (this.modal) {
      this.modal.style.display = "block";
    }
  }
  /**
   * This will open the burn figure and close the NAV bar
   * @param event
   */
  public showBurnup(event: MouseEvent) {
    if (this.burnupSection instanceof HTMLElement) {
      this.burnupSection.style.display = "flex";
      this.hideNav();
    }
  }
  /**
   * this will show the CFD figure enclosed the NAV bar
   * @param event
   */
  public async showCFD(event: MouseEvent) {
    if (this.cfdSection instanceof HTMLElement) {
      this.cfdSection.style.display = "flex";
      this.hideNav();
    }
  }
  /**
   * This will show the TAG figure and close the NAV bar
   * @param event
   */
  public showTAG(event: MouseEvent) {
    if (this.tagSection instanceof HTMLElement) {
      this.tagSection.style.display = "flex";
      this.hideNav();
    }
  }
  /**
   * This will close any of the figures that are open and open the NAV bar
   * @param event
   */
  public showAgileNav(event: MouseEvent) {
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
let project: ProjectUI;
/**
 * Class responsible for transforming Kanban lifecycle data into Chart.js-ready datasets for CFD visualization.
 */
class CFD_ChartElement {
  /** Optional display label for the chart */
  public label?: string;

  /** Fill style used in the chart (usually 'origin' for stacked area effect) */
  public fill: string | boolean;
  /** Full raw input Kanban data */
  public rawData: KanbanData | null;
  /** List of Kanban columns extracted from the raw data */
  public columnArray: Column[];
  /** Flattened list of all documents present in the columns */
  public docsArray: KanbanDocument[];
  /**
   * Maps each column ID to a record of timestamp ➝ +1/-1 values.
   * Used to track entry/exit lifecycle deltas.
   */
  public columnLifeTimeMap: Map<string, Record<number, number>>;
  /** Array of columnLifeTime objects extracted per document */
  public columnLifeTimeArray: ColumnNameMap[] | null;
  /** Final dataset array to be passed into Chart.js */
  public dataSet: any;

  /**
   * Initializes the parser with Kanban data.
   * @param paramData Raw Kanban structure containing columns and documents
   */
  constructor(paramData: KanbanData) {
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
      this.columnLifeTimeArray.forEach((lifetimeArray: ColumnNameMap) => {
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
    const allTimestampsSet = new Set<number>();

    // Collect all timestamps from all columns to be able to add up the values to stack. in milliseconds

    this.columnLifeTimeMap.forEach((timeMap) => {
      Object.keys(timeMap).forEach((t) => allTimestampsSet.add(Number(t)));
    });
    // Sort all unique timestamps because they were in order or some reason
    const allTimestamps = Array.from(allTimestampsSet).sort((a, b) => a - b);
    const datasets: any = [];
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
  public label?: string;

  /** Fill style used in the chart (usually 'origin' for stacked area effect) */
  public fill: string | boolean;
  /** Full raw input Kanban data */
  public rawData: KanbanData | null;
  /** List of Kanban columns extracted from the raw data */
  public columnArray: Column[];
  /** Flattened list of all documents present in the columns */
  public docsArray: KanbanDocument[];
  /**
   * Maps each column ID to a record of timestamp ➝ +1/-1 values.
   * Used to track entry/exit lifecycle deltas.
   */
  public columnLifeTimeMap: Map<string, Record<number, number>>;
  /** Array of columnLifeTime objects extracted per document */
  public columnLifeTimeArray: ColumnNameMap[] | null;
  /** Final dataset array to be passed into Chart.js */
  public dataSet: any;

  /**
   * Initializes the parser with Kanban data.
   * @param paramData Raw Kanban structure containing columns and documents
   */
  constructor(paramData: KanbanData) {
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
      this.columnLifeTimeArray.forEach((lifetimeArray: ColumnNameMap) => {
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
    let output: number[] = [];
    let label: string = "";
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
    let docBirthTimes: any = [];
    // This will be the title for the last column
    let lastColumnTitle: string = "";
    // This will be where I gather The Times where documents have been completed
    let completedBirthTimes: any = [];
    // And this is going to represent X & Y data for the total of documents.
    let totalDocs = [];

    // I realized that I already had an array of all the documents.
    // And since the documents names included creation time it was the easy way to grab that.
    docBirthTimes = this.docsArray
      .map((element) => {
        return Number(element.id.split("doc-")[1]);
      })
      .sort((a, b) => a - b);

    totalDocs = docBirthTimes.map((creationTime: number, i: number) => {
      return {
        x: creationTime,
        y: i + 1,
      };
    });
    // I create another method to do this keep this more organized.
    completedBirthTimes = this.getCompletedDocumentArray();
    // But here's where I real that I didn't have a trailing data point To match the completed data set
    let sittingY = totalDocs.length;
    completedBirthTimes.data.forEach((object: { x: number; y: number }) => {
      totalDocs.push({ x: object.x, y: sittingY });
      totalDocs.sort(
        (a: { x: number; y: number }, b: { x: number; y: number }) => a.x - b.x
      );
    });

    const datasets: any = [];

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

class TAG_ChartElement {
  /** Label shown on the chart — useful for identifying the dataset when multiple charts are rendered. */
  public label?: string;

  /** Determines how the area under the chart is filled — 'origin' creates a stacked effect for cumulative flow. */
  public fill: string | boolean;

  /** Stores the original Kanban data so downstream methods can trace back to source structure. */
  public rawData: KanbanData | null;

  /** Extracted column definitions — used to map document flow and build axes. */
  public columnArray: Column[];

  /** Flattened list of all documents — centralizing them simplifies lifecycle and aging calculations. */
  public docsArray: KanbanDocument[];

  /**
   * Tracks when documents enter and exit each column.
   * The +1/-1 pattern enables cumulative flow analysis by showing net document movement over time.
   */
  public columnLifeTimeMap: Map<string, Record<number, number>>;

  /**
   * Captures each document’s journey through the board.
   * This structure is critical for understanding individual document aging and column-specific cycle times.
   */
  public columnLifeTimeArray: ColumnNameMap[] | null;

  /**
   * Final dataset passed to Chart.js.
   * Built to reflect document aging and flow, not just raw counts — enabling more meaningful visualizations.
   */
  public dataSet: ChartDataset<"line" | "bar", number[]>[];

  /**
   * Tracks the longest document cycle time.
   * Used as a baseline for percentile calculations and aging comparisons.
   */
  public firstTaskEver: number | null = null;

  /**
   * Initializes the parser with Kanban data.
   * @param paramData Raw Kanban structure containing columns and documents
   */
  constructor(paramData: KanbanData) {
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
  perColumnPercents(): PercentileSeries[] {
    let columnMap = new Map();
    this.columnArray.forEach((e, i) => columnMap.set(e.id, i));
    let daysPerColumnArray: number[][] = Array.from(
      { length: columnMap.size },
      () => []
    );
    this.columnLifeTimeArray?.forEach((doc: any, i: number, a: any) => {
      for (let [key, columnTemp] of Object.entries(doc)) {
        let column = columnTemp as number[];
        if (column.length % 2 === 0) {
          for (let j = 0; j < column.length; j = j + 2) {
            let days = this.convertToDays(column[j + 1] - column[j]);
            daysPerColumnArray[columnMap.get(key)].push(days);
          }
        }
      }
    });
    const p = [50, 70, 85, 95, 100];

    let oldestDoc: number = 0;
    daysPerColumnArray
      .flat()
      .forEach((e) =>
        e > oldestDoc ? (oldestDoc = e) : (oldestDoc = oldestDoc)
      );
    this.firstTaskEver = oldestDoc;
    daysPerColumnArray = daysPerColumnArray.map((e) => e.sort((a, b) => a - b));
    let cDay: number = 0;
    let FivePercentileArrays: Array<any[]> = [
      [],
      [],
      [],
      [],
      [Array.from({ length: columnMap.size }, () => oldestDoc)],
    ];
    let memo: MemoMatrix = [[], [], [], [], []];
    let columnAging: Array<{ x: number; y: number | null }[]> =
      FivePercentileArrays.map((per, i) => {
        return daysPerColumnArray.map((aArray, j, a) => {
          let perNum = per.flat() ?? 0;
          let n: number = aArray.length;
          let c: number = Math.max(0, Math.ceil((p[i] / 100) * n - 1));
          memo[i][j] = aArray[c];
          if (i - 1 >= 0) {
            const curr: number = perNum[j] ?? 0;
            const mem: number = memo[i]?.[j] ?? 0;
            const prev: number = memo[i - 1]?.[j] ?? 0;

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
  getPercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
  /**
   * Measures overall cycle time percentiles for completed documents.
   * Focuses on the last column to determine when tasks are truly done — filtering out partial progress.
   */
  getPercentiles(): number[] {
    const lastColumn = this.rawData?.columns.at(-1)?.id;
    if (!lastColumn) return [];

    this.getLifeTimeMap();
    this.getColumnLifeTimeArray();

    const completedList =
      this.columnLifeTimeArray?.flatMap((doc) => {
        if (!Object.hasOwn(doc, lastColumn)) return [];
        let lifeSpan = [Number.MAX_SAFE_INTEGER, 0];
        for (let column in doc) {
          doc[column].forEach((ts: number) => {
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
      this.columnLifeTimeArray.forEach((lifetimeArray: ColumnNameMap) => {
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
    return this.docsArray.map((e: KanbanDocument) => e.title);
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
  getXVariables(): string[] {
    let xAxisTitles: string[] = this.columnArray.map(
      (column: any) => column.title
    );
    return xAxisTitles;
  }
  /**
   * Calculates how long each document has been in its current column.
   * This reveals aging patterns — helping teams spot tasks that are stagnating or overdue.
   */
  getYAxisAges(): number[][] {
    let timeStamps: number[][] = this.getTimeEnteredColumn();
    return this.daysSince(timeStamps);
  }
  /**
   * Converts timestamps to age in days.
   * Normalizes data to a human-readable format — milliseconds aren’t intuitive for cycle time analysis.
   */
  daysSince(ArrayDateArray: number[][]): number[][] {
    const now: number = Date.now();
    const output: number[][] = ArrayDateArray.map((dateArray: number[]) =>
      dateArray.map((aDate: number) => this.convertToDays(now - aDate))
    );
    return output;
  }
  /**
   * Extracts the entry time for each document in each column.
   * Assumes the first timestamp marks entry — this simplifies aging calculations but relies on consistent data structure.
   */
  getTimeEnteredColumn(): number[][] {
    const timeStampArray: number[][] = this.columnArray.map((column: Column) =>
      column.documents.map(
        (doc: KanbanDocument) => doc.columnLifeTime[column.id][0]
      )
    );
    return timeStampArray;
  }
  /**
   * Converts milliseconds to days.
   * Used throughout aging and percentile calculations to keep units consistent and interpretable.
   */
  convertToDays(ms: number): number {
    return Math.floor(ms / 86400000);
  }

  /**
   * Builds the final dataset for Chart.js.
   * Each point represents a document’s age in a column — jitter is added to reduce visual overlap and improve readability.
   * The goal isn’t just to show data, but to make patterns in document aging immediately visible.
   */
  getDataSet() {
    this.getDocumentArray();
    const yAxis: number[][] = this.getYAxisAges();
    const xAxis: string[] = this.getXVariables();
    let sign: number = -1;
    const jitter = (): number => {
      let a: number = sign * 0.05;
      sign = sign * -1;
      return a;
    };

    const data: Array<{ x: number; y: number | null }[]> = yAxis.map(
      (column: number[], i: number) => {
        if (i !== 0 && i !== yAxis.length - 1) {
          return column.map((days: number) => {
            return { x: i, y: Math.abs(days) + jitter() };
          });
        } else {
          return [{ x: i, y: null }];
        }
      }
    );
    return data;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  //create the instance Of the project after the DOM is loaded so everything can get initialized correctly
  project = new ProjectUI();
});
