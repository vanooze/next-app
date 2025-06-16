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
  { name: "Status", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];