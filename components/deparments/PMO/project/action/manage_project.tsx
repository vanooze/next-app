// "use client";
// import {
//   Tabs,
//   Tab,
//   Select,
//   SelectItem,
//   CalendarDate,
//   SelectSection,
//   Button,
// } from "@heroui/react";
// import { parseDate } from "@internationalized/date";
// import React, { useState, useEffect, useRef } from "react";
// import { Projects } from "@/helpers/acumatica";
// import { formatDatetoStr } from "@/helpers/formatDate";
// import { useUserContext } from "@/components/layout/UserContext";
// import { useRouter } from "next/navigation";
// // import { useActivityLog } from "@/components/hooks/useNotification";
// import {
//   selectFiliteredDesign,
//   selectFiltiredPmo,
//   selectPurchasing,
//   selectSales,
// } from "@/helpers/data";
// import SalesOrder from "@/components/contents/SO/sales_order";
// import Documentation from "@/components/contents/documentation/documentation";
// import PreProjectKickOff from "@/components/contents/projectKickOff/pre_project_kickoff";
// import ProjectValidation from "@/components/contents/projectValidation/project_validation";
// import ProjectExecution from "@/components/contents/projectExecution/project_execution";
// import ProjectCompletion from "@/components/contents/projectCompletion/project_completion";
// import PostProject from "@/components/contents/postProject/post_project";

// interface ManageProjectProps {
//   project: Projects | null;
// }

// const headingClasses =
//   "flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small";

// const allowedDesignations = new Set([
//   "PMO TL",
//   "DOCUMENT CONTROLLER",
//   "TECHNICAL ASSISTANT MANAGER",
//   "IT SUPERVISOR",
//   "TECHNICAL SUPERVISOR",
//   "TECHNICAL ADMIN CONSULTANT",
//   "DESIGN SUPERVISOR",
//   "TECHNICAL MANAGER",
// ]);

// export const ManageProject = ({ project }: ManageProjectProps) => {
//   const { user } = useUserContext();
//   const router = useRouter();
//   // const { logActivity } = useActivityLog();

//   const [projectCustomer, setProjectCustomer] = useState("");
//   const [projectDate, setProjectDate] = useState<CalendarDate | null>(null);
//   const [accessUsers, setAccessUsers] = useState<Set<string>>(new Set());
//   const [isSaving, setIsSaving] = useState(false);

//   const originalAccessUsers = useRef<Set<string>>(new Set());

//   const canAssign =
//     user?.name === "Kaye Kimberly L. Manuel" ||
//     allowedDesignations.has(user?.designation ?? "");

//   useEffect(() => {
//     if (!project) return;
//     setProjectCustomer(project.customer);

//     if (typeof project.date === "string") {
//       const isoDate = normalizeToISO(project.date);
//       setProjectDate(parseDate(isoDate));
//     }

//     if (project.access) {
//       const accessList = new Set(
//         project.access
//           .split(",")
//           .map((name) => name.trim())
//           .filter(Boolean)
//       );
//       setAccessUsers(accessList);
//       originalAccessUsers.current = new Set(accessList);
//     }
//   }, [project]);

//   const normalizeToISO = (input: string): string => {
//     const parts = input.split(/[-\/]/);
//     if (parts.length !== 3) return input;

//     const [a, b, c] = parts.map((p) => p.padStart(2, "0"));
//     return a.length === 4 ? `${a}-${b}-${c}` : `${c}-${a}-${b}`;
//   };

//   const handleAddAccess = async () => {
//     if (!project?.idkey) return;
//     setIsSaving(true);

//     try {
//       // const toAdd = [...accessUsers].filter(
//       //   (u) => !originalAccessUsers.current.has(u)
//       // );
//       // const toRemove = [...originalAccessUsers.current].filter(
//       //   (u) => !accessUsers.has(u)
//       // );

//       const res = await fetch("/api/department/PMO/project/access", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           projectId: project.idkey,
//           accessList: [...accessUsers],
//         }),
//       });

//       const result = await res.json();
//       if (!res.ok) throw new Error(result.error || "Failed to update access");

//       // ------------------------------- FOR NOTIFICATION -------------------------------
//       // for (const name of toAdd) {
//       //   await logActivity({
//       //     user_id: user?.user_id ?? null,
//       //     name,
//       //     action: "Assigned Project Access",
//       //     table_name: "Project Monitoring",
//       //     record_id: project.idkey,
//       //     title: `Project Access Granted`,
//       //     description: `You have been granted access to project: ${project.customer}`,
//       //     link: `/project/${project.idkey}`,
//       //     delete: 0,
//       //   });
//       // }

//       // for (const name of toRemove) {
//       //   await fetch(
//       //     `/api/notification/delete?name=${name}&projectId=${project.idkey}&table=Project%20Monitoring&action=Assigned%20Project%20Access`,
//       //     { method: "DELETE" }
//       //   );
//       // }

//       alert("Access updated successfully.");
//     } catch (err) {
//       console.error("❌ Error updating access:", err);
//       alert("Failed to update access.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const renderAccessSection = () => (
//     <div className="max-w-md p-1">
//       <h2 className="text-md font-semibold p-1">Assign project access to:</h2>
//       <Select
//         selectionMode="multiple"
//         items={selectFiltiredPmo}
//         label="Give access to:"
//         placeholder="Select users"
//         variant="bordered"
//         selectedKeys={accessUsers}
//         onSelectionChange={(keys) => {
//           if (keys !== "all") {
//             setAccessUsers(keys as Set<string>);
//           } else {
//             setAccessUsers(new Set(selectFiltiredPmo.map((item) => item.key)));
//           }
//         }}
//       >
//         {[
//           { title: "PMO", data: selectFiltiredPmo },
//           { title: "Sales", data: selectSales },
//           { title: "Design", data: selectFiliteredDesign },
//           { title: "Purchasing", data: selectPurchasing },
//         ].map(({ title, data }) => (
//           <SelectSection
//             key={title}
//             classNames={{ heading: headingClasses }}
//             title={title}
//           >
//             {data.map((item) => (
//               <SelectItem key={item.key}>{item.label}</SelectItem>
//             ))}
//           </SelectSection>
//         ))}
//       </Select>
//       <p className="text-small text-default-500 p-1">
//         Selected people: {Array.from(accessUsers).join(" | ")}
//       </p>
//       <Button
//         color="primary"
//         className="max-w-lg mt-2"
//         isDisabled={accessUsers.size === 0 || !project?.idkey}
//         isLoading={isSaving}
//         onPress={handleAddAccess}
//       >
//         {isSaving ? "Saving..." : "Submit"}
//       </Button>
//     </div>
//   );

//   const renderTabs = () => (
//     <Tabs size="lg" aria-label="Options" placement="top" variant="underlined">
//       <Tab key="Sales Order" title="Sales Order">
//         <SalesOrder project={project} />
//       </Tab>
//       <Tab key="Documentation" title="Documentation">
//         <Documentation project={project} />
//       </Tab>
//       <Tab key="Project Kick Off" title="Project Kick Off">
//         <PreProjectKickOff project={project} />
//       </Tab>
//       <Tab key="Project Validation" title="Project Validation">
//         <ProjectValidation />
//       </Tab>
//       <Tab key="Project Execution" title="Project Execution">
//         <ProjectExecution />
//       </Tab>
//       <Tab key="Project Completion" title="Project Completion">
//         <ProjectCompletion />
//       </Tab>
//       <Tab key="Post Project" title="Post Project">
//         <PostProject />
//       </Tab>
//     </Tabs>
//   );

//   return (
//     <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => router.back()}
//           className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded"
//         >
//           ← Back
//         </button>
//       </div>

//       <h3 className="text-2xl font-semibold">{projectCustomer}</h3>
//       <h1 className="text-lg font-semibold">
//         {projectDate ? formatDatetoStr(projectDate) : ""}
//       </h1>

//       {canAssign && renderAccessSection()}
//       <div className="flex flex-wrap justify-between items-center">
//         <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
//           {renderTabs()}
//         </div>
//       </div>
//     </div>
//   );
// };
