//-------------------------- DAVAO SEPERATION --------------------------

export const DAVAO_SEPERATION = ["DAVAO"];

//-------------------------- SIDEBAR RESTRICTION --------------------------
export const SIDEBAR_ACCESS_FOR_PROJECT_DESIGNATION = [
  "PRESIDENT",
  "VICE PRESIDENT",
  "SALES",
  "DESIGN",
  "PURCHASING",
  "PMO",
  "TECHNICAL",
  "IT/DT MANAGER",
  "DOCUMENT CONTROLLER",
  "DAVAO MANAGER",
];

export const SIDEBAR_ACCESS_FOR_TASK_DESIGNATION = [
  "PRESIDENT",
  "VICE PRESIDENT",
  "TECHNICAL MANAGER",
  "PMO",
  "DESIGN",
  "SALES",
  "IT/DT MANAGER",
  "IT",
  "PROGRAMMER",
  "MMC",
  "DAVAO",
];

export const SIDEBAR_ACCESS_FOR_SALES_DESIGNATION = [
  "PRESIDENT",
  "VICE PRESIDENT",
  "TECHNICAL MANAGER",
  "IT/DT MANAGER",
  "SALES",
  "DAVAO MANAGER",
];

export const SIDEBAR_ACCESS_FOR_INVENTORY_DESIGNATION = [
  "PRESIDENT",
  "VICE PRESIDENT",
  "TECHNICAL MANAGER",
  "INVENTORY",
  "PURCHASING",
];

//-------------------------- TASKS RESTRICTION --------------------------

export const DESIGN_TASKS_ACCESS_DESIGNATION = [
  "PRESIDENT",
  "VICE PRESIDENT",
  "DESIGN",
  "IT/DT MANAGER",
  "TECHNICAL MANAGER",
  "SALES",
  "DAVAO",
];

export const ITDT_TASKS_ACCESS_DESIGNATION = [
  "PROGRAMMER",
  "IT TECHNICAL",
  "IT SUPERVISOR",
  "MMC",
];

export const PMO_TASKS_ACCESS_DESIGNATION = ["PMO"];
//-------------------------- SALES DEPARTMENT RESTRICTION --------------------------

export const SALE_SEE_ALL_USERS_DESIGNATION = [
  "PRESIDENT",
  "VICE PRESIDENT",
  "TECHNICAL MANAGER", // MJ
  "SALES MANAGER", // Ronald, Cyril
  "IT/DT MANAGER", // Harold
  "SALES ASSISTANT", // Desiree Salivio
];

export const SALE_DAVAO_SEE_USERS_DESIGNATION = [
  "DAVAO MANAGER",
  "DAVAO SALES MANAGER",
];

export const SALE_NAME_MAPPINGS: Record<string, Record<string, string>> = {
  MAIN: {
    "Jhoannah Rose-Mil L. Sicat ": "JHOAN",
    "Genevel Garcia": "GEN",
    "KENNETH BAUTISTA": "KENNETH",
    "Ida Ma. Catherine C. Madamba": "IDA",
    "Earl Jan E. Acierda": "EARL JAN",
    "Evelyn Pequiras": "EVE",
    "Francine Kisha Guatlo": "KISHA",
    "Cellano Cyril Nicolo D. Javan": "CYRIL",
    "Ronaldo J. Francisco": "RONALD",
  },
  DAVAO: {
    "Joemar Banichina": "JOEMAR",
    "Ramielyn Malaya": "RAM",
    "Erson Lastimado": "ERSON",
    "Jaylord Catalan": "JAYLORD",
  },
} as const;

export const SALES_PERSONNEL_MAP: Record<string, string> = {
  "Lani Campos": "LSC",
  "Lea Bermudez": "MLB",
  "Marvin Jimenez": "MJ",
  "Harold David": "HAROLD",
  "Alliah Pear Robles": "ALI",
  "Kenneth Bautista": "KENNETH",
  "Saira Gatdula": "SAIRA",
  "Jhoannah Sicat": "JHOAN",
  "Desiree Salivio": "DESIREE",
  "Ida Madamba": "IDA",
  "Evelyn Pequiras": "EVE",
  "Genevel Garcia": "GENEVEL",
  "Judie Ann Manuel": "JAM",
  "Erwin Talavera": "ERWIN T.",
  "Cellano Cyril D. Javan": "CYRIL",
  "Francine Kisha Guatlo": "KISHA",
  "Mark Edzel Castillo": "EDZEL",
  "Ronaldo Francisco": "RONALD",
  "Erwin Del Rosario": "ERWIN",
  "Lawrence Ducut": "ENCHONG",
  "Aaron Opinaldo": "AARON",
  "Ashly Alvaro": "ASH",
  "Joemar Banichina": "JOEMAR",
  "Ramielyn Malaya": "RAM",
  "Erson Lastimado": "ERSON",
  "Jaylord Catalan": "JAYLORD",
  "Earl Jan E. Acierda": "EARL JAN",
  "Myleen Ligue": "MYLEEN",
};

// -------------------------- DESIGN DEPARTMENT RESTRICTION --------------------------

export const DESIGN_SEE_ALL_USERS_DESIGNATION = [
  "PRESIDENT",
  "VICE PRESIDENT",
  "DESIGN",
  "TECHNICAL MANAGER", // MJ
  "IT SUPERVISOR", // Erwin
  "IT/DT MANAGER", // Harold
  "SALES ASSISTANT", // Desiree Salivio
];

export const DESIGN_NAME_MAPPINGS: Record<string, Record<string, string>> = {
  MAIN: {
    "Jhoannah Rose-Mil L. Sicat ": "JHOAN",
    "Genevel Garcia": "GEN",
    "KENNETH BAUTISTA": "KENNETH",
    "Ida Ma. Catherine C. Madamba": "IDA",
    "Earl Jan E. Acierda": "EARL JAN",
    "Evelyn Pequiras": "EVE",
    "Francine Kisha Guatlo": "KISHA",
    "Cellano Cyril Nicolo D. Javan": "CYRIL",
    "Ronaldo J. Francisco": "RONALD",
  },
  DAVAO: {
    "Joemar Banichina": "JOEMAR",
    "Ramielyn Malaya": "RAM",
    "Erson Lastimado": "ERSON",
    "Jaylord Catalan": "JAYLORD",
  },
} as const;
export const DESIGN_CAN_UPLOAD = [
  "TECHNICAL MANAGER", // MJ
  "IT/DT MANAGER", // Harold
];

export const DESIGN_CAN_DELETE = [
  "DESIGN SUPERVISOR",
  "DESIGN ASSISTANT SUPERVISOR",
];

export const DESIGN_DAVAO_SEE_ALL_USERS: string[] = [
  "DAVAO MANAGER",
  "DAVAO SUPERVISOR",
];

// -------------------------- IT/MMC DEPARTMENT RESTRICTION --------------------------

export const IT_SEE_ALL_USERS_DESIGNATION = [
  "PRESIDENT",
  "VICE PRESIDENT",
  "IT/DT MANAGER", // Harold
  "PROGRAMMER SUPERVISOR", // Ramon
  "IT SUPERVISOR", //Erwin
];

export const IT_NAME_MAPPINGS: Record<string, string> = {
  "IVAN BRADLEY BALO": "ivan",
  "HASSAN E. AYONAN": "hassan",
  "RHON PACLEB": "rhon",
  "CHARLES JOSEPH R. CABRERA": "charles joseph",
  "AARON VINCENT A. OPINALDO": "aaron",
  "ASHLY ALVARO": "ashley",
  "ELIEZER MANUEL HERRERA": "eliezer",
};

// --------------------------  PROJECT MONITORING RESTRICTION --------------------------

export const PROJECT_ASSIGN_ACCESS_DESIGNATION = [
  // MANAGER
  "IT/DT MANAGER",
  "TMIG MANAGER",
  "DAVAO OIC",
  "TECHNICAL ASSISTANT MANAGER",
  "DAVAO SALES MANAGER",
  "SALES DESTECH MANAGER",
  "SALES MANAGER",
  "TECHNICAL MANAGER",
  // SUPERVISOR
  "TMIG SUPERVISOR",
  "TECHNICAL SUPERVISOR",
  "TECHNICAL ADMIN CONSULTANT",
  // OTHERS
  "PMO",
  "DOCUMENT CONTROLLER",
];

// -------------------------- DOCUMENTATION RESTRICTION --------------------------

export const BOQ_CAN_UPLOAD_DESIGNATION = [
  "DESIGN",
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
  "TECHNICAL ASSISTANT MANAGER",
  "TMIG MANAGER",
  "TMIG SUPERVISOR",
];

export const CONCEPTUAL_CAN_UPLOAD_DESIGNATION = [
  "DESIGN",
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const PRE_PROJECT_AGREEMENT_CAN_UPLOAD_DESIGNATION = [
  "SALES",
  "DESIGN",
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const SOW_CAN_UPLOAD_DESIGNATION = [
  "SALES",
  "DESIGN",
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

// -------------------------- SALES ORDER RESTRICTION --------------------------

export const PROJECT_ORDER_CAN_UPLOAD_DESIGNATION = [
  "SALES",
  "PMO",
  "DESIGN",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
  "TECHNICAL SUPERVISOR",
];

export const PROJECT_TURN_OVER_CAN_UPLOAD_DESIGNATION = [
  "SALES",
  "PMO",
  "DESIGN",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
  "TECHNICAL SUPERVISOR",
];

export const PROPOSAL_CAN_UPLOAD_DESIGNATION = [
  "SALES",
  "PMO TL",
  "DOCUMENT CONTROLLER",
  "TECHNICAL SUPERVISOR",
  "DESIGN",
];

export const TOR_CAN_UPLOAD_DESIGNATION = [
  "SALES",
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL SUPERVISOR",
  "DESIGN",
  "IT/DT MANAGER",
];

// -------------------------- PROJECT KICK OFF RESTRICTION --------------------------

export const MOM_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const SIGNED_BOQ_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "TECHNICAL COORDINATOR",
  "DOCUMENT CONTROLLER",
];

export const BUDGET_KICK_OFF_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "IT/DT MANAGER",
  "TECHNICAL MANAGER",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const CHART_KICK_OFF_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
];

export const SIGNED_CONCEPTUAL_CAN_UPLOAD_DESIGNATION = [
  "DESIGN",
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const CONTRACTORS_CAN_GENERATE_LINK_DESIGNATION = ["PMO"];

export const MANPOWER_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
  "TECHNICAL MANAGER",
  "IT/DT MANAGER",
  "TMIG MANAGER",
  "TMIG SUPERVISOR",
  "TMIG ASSISTANT SUPERVISOR",
];

export const PROCUREMENT_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DESIGN",
  "TECHNICAL MANAGER",
  "TMIG MANAGER",
  "TMIG SUPERVISOR",
  "TMIG ASSISTANT SUPERVISOR",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const RISK_MANAGMENT_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

// -------------------------- PROJECT VALIDATION RESTRICTION --------------------------
export const BUDGET_VALIDATION_CAN_CREATE_DESIGNATION = [];

export const CONTRACTORS_VALIDATION_CAN_GENERATE_DESIGNATION = [
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
  "PMO",
];

export const EQUIPMENT_CAN_EDIT_DESIGNATION = [
  "DESIGN",
  "TECHNICAL MANAGER",
  "TMIG MANAGER",
  "TMIG SUPERVISOR",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
  "ADMIN PURCHASING",
];

export const PLANS_VALIDATION_CAN_EDIT_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const RISK_MANAGEMENT_VALIDATION_CAN_EDIT_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];
// -------------------------- PROJECT EXECUTION RESTRICTION --------------------------

export const ACCOUNTING_CAN_UPLOAD_DESIGNATION = [
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const MANPOWER_DELEGATION_CAN_ASSIGN_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "IT/DT MANAGER",
  "TECHNICAL ASSISTANT MANAGER",
  "IT SUPERVISOR",
  "TMIG MANAGER",
  "TMIG SUPERVISOR",
  "TECHNICAL SUPERVISOR",
  "DESIGN SUPERVISOR",
];

export const CHART_CAN_CREATE_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

// -------------------------- PROJECT COMPLETION RESTRICTION --------------------------

export const BUILT_PLANS_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const COA_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "TMIG",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const COC_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "TMIG",
  "SALES ASSISTANT",
  "PURCHASING",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const COP_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "TMIG",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const CSAT_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "TMIG",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
  "SALES CUSTOMER SERVICE",
];

export const DR_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "TMIG",
  "ACCOUNTING",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const SI_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "SALES",
  "ACCOUNTING",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const TRAINEE_ACCEPTANCE_CAN_UPLOAD_DESIGNATION = [
  "TMIG",
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const WAR_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

export const WARRANTY_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "TMIG",
  "SALES CUSTOMER SERVICE",
  "DOCUMENT CONTROLLER",
  "TECHNICAL COORDINATOR",
];

// -------------------------- POST PROOJECT RESTRICTION --------------------------

export const AWARDING_DOCU_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
];

export const CONTRACTORS_EVAL_CAN_UPLOAD_DESIGNATION = [
  "DOCUMENT CONTROLLER",
  "PMO",
];

export const NCCAPA_CAN_UPLOAD_DESIGNATION = ["DESIGN", "DOCUMENT CONTROLLER"];

export const OVERALL_REPORT_CAN_UPLOAD_DESIGNATION = [
  "PMO",
  "DOCUMENT CONTROLLER",
];

export const POST_PROJ_REVIEW_CAN_UPLOAD_DESIGNATION = ["DOCUMENT CONTROLLER"];

export const POST_PROJ_CAN_UPLOAD_DESIGNATION = [
  "TECHNICAL MANAGER",
  "ACCOUNTING SUPERVISOR",
  "IT SUPERVISOR",
  "VICE PRESIDENT",
  "PRESIDENT",
  "DOCUMENT CONTROLLER",
  "TECHNICAL ASSISTANT MANAGER",
];

export const VALUE_ENG_CAN_UPLOAD_DESIGNATION = [
  "TECHNICAL ASSISTANT MANAGER",
  "DOCUMENT CONTROLLER",
];
