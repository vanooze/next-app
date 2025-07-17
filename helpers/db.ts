// ------------------------- DESIGN TASK DESIGINATION -------------------------
export interface dtTask {
  id: number;
  clientName: string;
  projectDesc: string;
  salesPersonnel: string;
  dateReceived: string | null;
  systemDiagram: string | null;
  eBoqDate: string | null;
  structuralBoq: string | null;
  sBoqDate: string | null;
  sirME: string | null;
  sirMJH: string | null;
  status: string;
}

export const dtColumns = [
  { name: "Status", uid: "status" },
  { name: "Client Name", uid: "clientName" },
  { name: "Project Descriptions", uid: "projectDesc" },
  { name: "Date Received", uid: "dateReceived" },
  { name: "Sales Personnel", uid: "salesPersonnel" },
  { name: "System Diagram", uid: "systemDiagram" },
  { name: "Endorsed Date", uid: "eBoqDate" },
  { name: "Structural BOQ", uid: "structuralBoq" },
  { name: "Endorsed Date", uid: "sBoqDate" },
  { name: "Sir ME", uid: "sirME" },
  { name: "Sir MJ/Harold", uid: "sirMJH" },
  { name: "ACTIONS", uid: "actions" },
];

// ------------------------- PROJECT MONITORING -------------------------

export interface ProjectMonitoring {
  id: number;
  idkey: number;
  soNumber: number;
  customer: string;
  contactPerson: string;
  sales: string;
  date: string | null;
  status: string;
  access: string | null;
}

export const ProjectMonitoringColumns = [
  { name: "SO Number", uid: "soNumber" },
  { name: "Customer", uid: "customer" },
  { name: "Contact Person", uid: "contactPerson" },
  { name: "Sales/Consultant", uid: "sales" },
  { name: "Date", uid: "date" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions" },
];

// ------------------------- TASKS PER PROJECT -------------------------

export interface ProjectTask {
  taskKey: number;
  soId: number;
  taskTodo: string;
  dateFilled: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  notes: string;
  type: string;
  status: string;
  pmoOfficer: string;
  donePending: string;
  doneDate: string | null;
  positionOrder: string;
}

export const ProjectTaskColumns = [
  { name: "SO ID", uid: "soID" },
  { name: "Task Todo", uid: "taskTodo" },
  { name: "Date Filled", uid: "dateFilled" },
  { name: "Date Start", uid: "dateStart" },
  { name: "Date End", uid: "dateEnd" },
  { name: "Notes", uid: "notes" },
  { name: "PMO Officer", uid: "pmoOfficer" },
  { name: "Done Date", uid: "doneDate" },
];

export const soColumn = [
  { name: "project Id", uid: "projectId" },
  { name: "project Name", uid: "projectName" },
  { name: "project Id", uid: "projectId" },
  { name: "assigned Personnel", uid: "assignedPersonnel" },
  { name: "description", uid: "description" },
  { name: "Attachment", uid: "attachmentName" },
  { name: "date", uid: "date" },
];

export const SOColumn = [
  { name: "Type", uid: "type" },
  { name: "ID", uid: "projectId" },
  { name: "Project Name", uid: "projectName" },
  { name: "Personnel", uid: "assignedPersonnel" },
  { name: "Description", uid: "description" },
  { name: "Attachment", uid: "attachmentName" },
  { name: "Date", uid: "date" },
];

// ------------------------- PMO TASKS -------------------------

export interface PMOTasks {
  id: number;
  clientName: string;
  taskDesc: string;
  dateStart: string;
  dateEnd: string;
  personnel: string;
  dateFinished: string | null;
  status: string;
}

export const PMOTasksColumn = [
  { name: "Status", uid: "status" },
  { name: "Client Name", uid: "clientName" },
  { name: "Description", uid: "taskDesc" },
  { name: "Date Start", uid: "dateStart" },
  { name: "Date End", uid: "dateEnd" },
  { name: "Personnel", uid: "personnel" },
  { name: "Date Finished", uid: "dateFinished" },
  { name: "Actions", uid: "actions" },
];

// ------------------------- NOTIFICATION -------------------------

export interface LogInput {
  user_id: number | null;
  name: string | null;
  action: string;
  table_name: string;
  record_id: number;
  title: string;
  description: string;
  link: string;
  delete: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  seen: boolean;
  link: string;
  delete: number;
}

// ------------------------- STOCK ITEMS -------------------------

export interface Items {
  id: number;
  inventoryId: string | null;
  description: string | null;
  type: string | null;
  subassembly: string | null;
  itemClass: string | null;
  postingClass: string | null;
  taxCategory: string | null;
  defaultWarehouse: string | null;
  baseUnit: string | null;
  defaultPrice: string | null;
  status: string | null;
}

export const ItemsColumns = [
  { name: "Inventory ID", uid: "inventoryId" },
  { name: "Description", uid: "description" },
  { name: "Type", uid: "type" },
  { name: "Subassembly", uid: "subassembly" },
  { name: "Item Class", uid: "itemClass" },
  { name: "Posting Class", uid: "postingclass" },
  { name: "Tax Category", uid: "taxCategory" },
  { name: "Default Warehouse", uid: "defaultWarehouse" },
  { name: "Base Unit", uid: "baseUnit" },
  { name: "Default Price", uid: "defaultPrice" },
  { name: "Status", uid: "status" },
];
