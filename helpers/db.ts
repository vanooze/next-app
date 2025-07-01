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
}

export const ProjectMonitoringColumns = [
  { name: "SO Number", uid: "soNumber" },
  { name: "Customer", uid: "customer" },
  { name: "Contact Person", uid: "contactPerson" },
  { name: "Sales/Consultant", uid: "sales" },
  { name: "Date", uid: "date" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions" },
  { name: "Tasks", uid: "tasks" },
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
