// import { LogInput } from "@/helpers/db";

// export const useActivityLog = () => {
//   const logActivity = async ({
//     user_id,
//     name,
//     action,
//     table_name,
//     record_id,
//     title,
//     description,
//     link,
//   }: LogInput): Promise<void> => {
//     console.log("➡️ Query Params:", { name, record_id, action });
//     if (!name || !record_id || !action) {
//       console.warn("⛔️ Missing required logActivity fields:", {
//         name,
//         record_id,
//         action,
//       });
//       return;
//     }

//     try {
//       const params = new URLSearchParams({
//         name,
//         record_id: String(record_id),
//         action,
//       });

//       const checkRes = await fetch(
//         `/api/notification/check-duplicate?${params}`
//       );

//       if (!checkRes.ok) {
//         console.error("❌ check-duplicate failed:", checkRes.status);
//         return;
//       }

//       let exists = false;
//       try {
//         const data = await checkRes.json();
//         exists = data.exists;
//       } catch (err) {
//         console.error("❌ Failed to parse JSON from check-duplicate:", err);
//         return;
//       }
//       if (exists) {
//         console.log("⛔️ Duplicate log detected. Skipping log creation.");
//         return;
//       }

//       // ✅ Send log to server
//       const res = await fetch("/api/notification/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user_id,
//           name,
//           action,
//           table_name,
//           record_id,
//           title,
//           description,
//           link,
//         }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         console.error("❌ Failed to send log:", result.error);
//       }
//     } catch (err) {
//       console.error("🚨 Error in logActivity:", err);
//     }
//   };

//   return { logActivity };
// };
