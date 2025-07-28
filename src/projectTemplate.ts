console.log("projectTemplate script is loaded");
// Browsers do not support bare module specifiers
declare var Chart: any;
type ChartData = any;
type Color = string;
type ColumnName = `column-${string}`;

type ColumnNameMap = { [columnId: string]: number[] };
type Dataset = Info[];

interface ColumnLifeTime {}
interface KanbanData {
  _id: string;
  projectId: string;
  columns: Column[];
}
interface Docu_ment {
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

  documents: Docu_ment[];
  maxDocu_ments: number | string;
  canAddDocu_ments: boolean;
  canChangeDocu_mentColor: boolean;
  canDeleteDocu_ments: boolean;
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
  private cfdData: any = null;
  private burnupData: any = null;
  private tagData: any = null;
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
    console.dir(Burnupdata);
    console.log(Burnupdata);

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
            colorschemes: {
              scheme: "brewer.Reds7",
              fillAlpha: 1.0,
            },
          },
        },
      });
    }
  }
  private async parseCFDdata(rawdata: KanbanData) {
    let dataParcer = new CFD_ChartElement(rawdata);
    let CFDdata: any = dataParcer.create();
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
    let dataParcer = new TAG_ChartElement(rawdata);
    let tagData: any = dataParcer.create();
    console.dir(tagData);
    console.log(tagData);

    if (this.tagChart) {
      new Chart(this.tagChart, {
        type: "line",
        data: {
          datasets: tagData,
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
  /** Optional raw Chart.js data structure (unused directly in this flow) */
  public data?: ChartData;
  /** Fill style used in the chart (usually 'origin' for stacked area effect) */
  public fill: string | boolean;
  /** Full raw input Kanban data */
  public rawData: KanbanData | null;
  /** List of Kanban columns extracted from the raw data */
  public columnArray: Column[];
  /** Flattened list of all documents present in the columns */
  public docsArray: Docu_ment[];
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
    this.columnLifeTimeArray = this.docsArray.map(
      (aDocument) => aDocument.columnLifeTime
    );
  }

  /**
   * Builds a Map of column lifecycle deltas.
   * +1 for entry, -1 for exit based on timestamp order.
   */
  getlifeTimeMap() {
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
  getDateSet() {
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
  /** Optional raw Chart.js data structure (unused directly in this flow) */
  public data?: ChartData;
  /** Fill style used in the chart (usually 'origin' for stacked area effect) */
  public fill: string | boolean;
  /** Full raw input Kanban data */
  public rawData: KanbanData | null;
  /** List of Kanban columns extracted from the raw data */
  public columnArray: Column[];
  /** Flattened list of all documents present in the columns */
  public docsArray: Docu_ment[];
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
    this.columnLifeTimeArray = this.docsArray.map(
      (aDocument) => aDocument.columnLifeTime
    );
  }

  /**
   * Builds a Map of column lifecycle deltas.
   * +1 for entry, -1 for exit based on timestamp order.
   */
  getlifeTimeMap() {
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
    };
  }
  /**
   * Converts document infomations including column life timestamps to datasets. to Track Flow of completion versus total documents.
   * Each column gets a line showing cumulative document count over time.
   * @returns Array of Chart.js dataset objects
   */
  getDateSet() {
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
    });
    datasets.push(completedBirthTimes);
    return datasets;
  }
}
class TAG_ChartElement {
  /** Optional display label for the chart */
  public label?: string;
  /** Optional raw Chart.js data structure (unused directly in this flow) */
  public data?: ChartData;
  /** Fill style used in the chart (usually 'origin' for stacked area effect) */
  public fill: string | boolean;
  /** Full raw input Kanban data */
  public rawData: KanbanData | null;
  /** List of Kanban columns extracted from the raw data */
  public columnArray: Column[];
  /** Flattened list of all documents present in the columns */
  public docsArray: Docu_ment[];
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
    this.columnLifeTimeArray = this.docsArray.map(
      (aDocument) => aDocument.columnLifeTime
    );
  }

  /**
   * Builds a Map of column lifecycle deltas.
   * +1 for entry, -1 for exit based on timestamp order.
   */
  getlifeTimeMap() {
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
    };
  }
  /**
   * Converts document infomations including column life timestamps to datasets. to Track Flow of completion versus total documents.
   * Each column gets a line showing cumulative document count over time.
   * @returns Array of Chart.js dataset objects
   */
  getDateSet() {
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
    });
    datasets.push(completedBirthTimes);
    return datasets;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  //create the instance Of the project after the DOM is loaded so everything can get initialized correctly
  project = new ProjectUI();
});
