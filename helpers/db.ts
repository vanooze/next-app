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

export interface BoqItem {
  id: number;
  project_id: string;
  category: string;
  subcategory: string | null;
  brand: string | null;
  description: string | null;
  unit: string | null;
  qty: number | null;
  remarks: string | null;
}

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

// ------------------------- SALES MANAGEMENT -------------------------
export interface SalesManagement {
  id: number;
  clientName: string;
  projectDesc: string;
  dateReceived: string | null;
  sirMJH: string | null;
  salesPersonnel: string;
  notes: string | null;
  status: string;
  dateAwarded: string | null;
}

export const SalesManagementColumns = [
  { name: "Status", uid: "status" },
  { name: "Client Name", uid: "clientName" },
  { name: "Project Description", uid: "projectDesc" },
  { name: "Date Received", uid: "dateReceived" },
  { name: "Sir MJ/Harold", uid: "sirMJH" },
  { name: "Sales Personnel", uid: "salesPersonnel" },
  { name: "Notes", uid: "notes" },
  { name: "Date Awarded", uid: "dateAwarded" },
  { name: "Actions", uid: "actions" },
];

// ------------------------- PO MONITORING -------------------------
export interface POMonitoring {
  id: number;
  poDate: string | null;
  poNumber: string | null;
  supplier: string;
  items: string;
  qty: number;
  uom: string;
  price: number;
  total: number;
  terms: string;
  poStatus: string;
  remarks: string | null;
  purpose: string;
  requester: string;
}

export const POMonitoringColumns = [
  { name: "Status", uid: "poStatus" },
  { name: "Date", uid: "poDate" },
  { name: "PO Number", uid: "poNumber" },
  { name: "Supplier", uid: "supplier" },
  { name: "Item", uid: "items" },
  { name: "QTY", uid: "qty" },
  { name: "UOM", uid: "uom" },
  { name: "Price", uid: "price" },
  { name: "Total", uid: "total" },
  { name: "Terms", uid: "terms" },
  { name: "Remarks", uid: "remarks" },
  { name: "Purpose", uid: "purpose" },
  { name: "Request by:", uid: "requester" },
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

// ------------------------- AWARDED MANAGEMENT -------------------------

export interface AwardedManagement {
  id: number;
  clientName: string;
  projectDesc: string;
  dateReceived: string | null;
  sirMJH: string | null;
  salesPersonnel: string;
  dateAwarded: string | null;
  notes: string | null;
  status: string;
}

export const AwardedManagementColumns = [
  { name: "Status", uid: "status" },
  { name: "Client Name", uid: "clientName" },
  { name: "Project Description", uid: "projectDesc" },
  { name: "Date Received", uid: "dateReceived" },
  { name: "Sir MJ/Harold", uid: "sirMJH" },
  { name: "Sales Personnel", uid: "salesPersonnel" },
  { name: "Date Awarded", uid: "dateAwarded" },
  { name: "Notes", uid: "notes" },
  { name: "Actions", uid: "actions" },
];

// ------------------------- RISK TABLE -------------------------

export type Likelihood = "Low" | "Medium" | "High";
export type Severity = "Low" | "Medium" | "High";
export type Status = "Open" | "In Progress" | "Closed";
export type Owner =
  | "Sales and Marketing"
  | "PMO"
  | "ADMIN"
  | "TMIG"
  | "Design"
  | "External Provider"
  | "International Procurement"
  | "Purchasing"
  | "";

export interface RiskRow {
  id: number;
  riskId: string;
  description: string;
  potentialImpact: string;
  likelihood: Likelihood;
  severity: Severity;
  isoClause: string;
  mitigation: string;
  owner: Owner;
  status: Status;
}

export const initialData: RiskRow[] = [
  {
    id: 1,
    riskId: "R-001",
    description: "Incomplete client requirements gathering",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.2.1",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 2,
    riskId: "R-002",
    description: "Subcontractor non-compliance with quality standards",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 3,
    riskId: "R-003",
    description: "Power supply, tapping point, mismatch at client site",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.3",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 4,
    riskId: "R-004",
    description: "Structural installation challenges",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 5,
    riskId: "R-005",
    description: "Late procurement of materials, equipment for local ",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.1.3",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 6,
    riskId: "R-006",
    description: "Supply chain (International) ",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 7,
    riskId: "R-007",
    description: "Inadequate risk assessment during planning",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "6.1",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 8,
    riskId: "R-008",
    description: "Poor communication among stakeholders ",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 9,
    riskId: "R-009",
    description: "Incomplete post-installation documentation",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.5",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 10,
    riskId: "R-010",
    description: "Lack of client training",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.5.1",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 11,
    riskId: "R-011",
    description: "Permits & Approvals",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 12,
    riskId: "R-012",
    description: "Deliveries",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.1, 10.2",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 13,
    riskId: "R-013",
    description: "Process/SOP Shortcuts",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.5.1, 10.2",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 14,
    riskId: "R-014",
    description: "Market Trend",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "4.1",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 15,
    riskId: "R-015",
    description: "Withholding Information ",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.4, 8.1, 10.2",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
];

export const guideTable: RiskRow[] = [
  {
    id: 1,
    riskId: "R-001",
    description: "Incomplete client requirements gathering",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.2.1",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 2,
    riskId: "R-002",
    description: "Subcontractor non-compliance with quality standards",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 3,
    riskId: "R-003",
    description: "Power supply, tapping point, mismatch at client site",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.3",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 4,
    riskId: "R-004",
    description: "Structural installation challenges",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 5,
    riskId: "R-005",
    description: "Late procurement of materials, equipment for local ",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.1.3",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 6,
    riskId: "R-006",
    description: "Supply chain (International) ",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 7,
    riskId: "R-007",
    description: "Inadequate risk assessment during planning",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "6.1",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 8,
    riskId: "R-008",
    description: "Poor communication among stakeholders ",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 9,
    riskId: "R-009",
    description: "Incomplete post-installation documentation",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.5",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 10,
    riskId: "R-010",
    description: "Lack of client training",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.5.1",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 11,
    riskId: "R-011",
    description: "Permits & Approvals",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.4",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 12,
    riskId: "R-012",
    description: "Deliveries",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.1, 10.2",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 13,
    riskId: "R-013",
    description: "Process/SOP Shortcuts",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "8.5.1, 10.2",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 14,
    riskId: "R-014",
    description: "Market Trend",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "4.1",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
  {
    id: 15,
    riskId: "R-015",
    description: "Withholding Information ",
    potentialImpact: "",
    likelihood: "Low",
    severity: "Low",
    isoClause: "7.4, 8.1, 10.2",
    mitigation: "",
    owner: "Sales and Marketing",
    status: "Open",
  },
];

export const likelihoodOptions = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
] as const;

export const severityOptions = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
] as const;

export const statusOptions = [
  { label: "Open", value: "Open" },
  { label: "In Progress", value: "In Progress" },
  { label: "Closed", value: "Closed" },
] as const;

export const ownerOptions = [
  { label: "Sales and Marketing", value: "Sales and Marketing" },
  { label: "PMO", value: "PMO" },
  { label: "ADMIN", value: "ADMIN" },
  { label: "TMIG", value: "TMIG" },
  { label: "Design", value: "Design" },
  { label: "External Provider", value: "External Provider" },
  { label: "International Procurement", value: "International Procurement" },
  { label: "Purchasing", value: "Purchasing" },
] as const;

export const riskLevelScores = {
  Low: 1,
  Medium: 3,
  High: 5,
} as const;
