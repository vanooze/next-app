import { LogInput } from "@/helpers/db";

export const useActivityLog = () => {
  const logActivity = async ({
    user_id,
    name,
    action,
    table_name,
    record_id,
    description,
    link,
    seen = 0,
  }: LogInput): Promise<void> => {
    // 🔍 Step 1: Debug input
    console.log("🔔 logActivity called with:", {
      user_id,
      name,
      action,
      table_name,
      record_id,
      description,
      link,
      seen,
    });

    if (!user_id || !name) {
      return;
    }

    try {
      const res = await fetch("/api/notification/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          name,
          action,
          table_name,
          record_id,
          description,
          link,
          seen,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("❌ Failed to send log:", result.error);
      }
    } catch (err) {
      console.error("🚨 Fetch error in logActivity:", err);
    }
  };

  return { logActivity };
};
