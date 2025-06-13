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