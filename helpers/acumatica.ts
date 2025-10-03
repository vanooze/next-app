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

// ------------------------- PROJECT -------------------------

export interface Projects {
  id: number;
  projectId: string | null;
  status: string | null;
  template: string | null;
  customerId: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  createdOn: string | null;
  currency: string | null;
  projectManager: string | null;
  access: string | null;
}

export const projectColumns = [
  { name: "Project ID", uid: "projectId" },
  { name: "Status", uid: "status" },
  { name: "Template", uid: "template" },
  { name: "Customer ID", uid: "customerId" },
  { name: "Start Date", uid: "startDate" },
  { name: "End Date", uid: "endDate" },
  { name: "Description", uid: "description" },
  { name: "Created On", uid: "createdOn" },
  { name: "Currency", uid: "currency" },
  { name: "Project Manager", uid: "projectManager" },
  { name: "Actions", uid: "actions" },
];

// ------------------------- SALES -------------------------

export interface Leads {
  id: number;
  DisplayName: string | null;
  accountName: string | null;
  description: string | null;
  contact: string | null;
  businessAccount: string | null;
  owner: string | null;
  createdOn: string | null;
  leadClass: string | null;
  source: string | null;
  sourceCampaign: string | null;
  status: string | null;
  duplicate: string | null;
  incomingActivity: string | null;
  outgoingActivity: string | null;
  email: string | null;
  phone: number | null;
}

export const leadsColumns = [
  { name: "Display Name", uid: "DisplayName" },
  { name: "Account Name", uid: "accountName" },
  { name: "Description", uid: "description" },
  { name: "contact", uid: "contact" },
  { name: "business Account", uid: "businessAccount" },
  { name: "Owner", uid: "owner" },
  { name: "Created On", uid: "createdOn" },
  { name: "Lead Class", uid: "leadClass" },
  { name: "Source", uid: "source" },
  { name: "Source Campagin", uid: "sourceCampaign" },
  { name: "Status", uid: "status" },
  { name: "Duplicate", uid: "duplicate" },
  { name: "Last Incoming Activity", uid: "incomingActivity" },
  { name: "Last Outgoing Acitivty", uid: "outgoingActivity" },
  { name: "Email", uid: "email" },
  { name: "Phone", uid: "phone" },
];
