import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "taskId is required" },
        { status: 400 }
      );
    }

    // Get proj_id from sales_management to fetch files from design_activity
    const [salesRecord] = await executeQuery(
      `SELECT proj_id FROM sales_management WHERE id = ?`,
      [taskId]
    );

    if (!salesRecord || !salesRecord.proj_id) {
      return NextResponse.json({ success: true, files: [], revisions: [] });
    }

    const projId = salesRecord.proj_id;

    // Fetch files from design_activity
    const [row] = await executeQuery(
      `SELECT profiting_file FROM design_activity WHERE id = ?`,
      [projId]
    );

    let files = [];
    let revisions = [];

    if (row && row.profiting_file) {
      try {
        const fileData = JSON.parse(row.profiting_file);
        
        // Check if it's the new revision format (array of objects) or old format (array of strings)
        if (Array.isArray(fileData) && fileData.length > 0) {
          if (typeof fileData[0] === 'object' && fileData[0].revision !== undefined) {
            // New format with revisions
            const revisionMap = new Map();
            
            fileData.forEach((file) => {
              const revision = file.revision || 0;
              if (!revisionMap.has(revision)) {
                revisionMap.set(revision, []);
              }
              const safeName = file.name.replace(/,/g, "-");
              revisionMap.get(revision).push({
                name: file.name,
                path: `/uploads/profitting/${encodeURIComponent(safeName)}`,
              });
            });

            // Convert to array of revisions, sorted by revision number
            revisions = Array.from(revisionMap.entries())
              .sort((a, b) => a[0] - b[0])
              .map(([revision, files]) => ({
                revision,
                files,
                label: revision === 0 ? "Original" : `Revision ${revision}`,
              }));

            // Flatten all files for backward compatibility
            files = fileData.map((file) => {
              const safeName = file.name.replace(/,/g, "-");
              return {
                name: file.name,
                path: `/uploads/profitting/${encodeURIComponent(safeName)}`,
                revision: file.revision || 0,
              };
            });
          } else {
            // Old format (array of strings) - treat as revision 0
            files = fileData.map((name) => {
              const safeName = name.replace(/,/g, "-");
              return {
                name,
                path: `/uploads/profitting/${encodeURIComponent(safeName)}`,
                revision: 0,
              };
            });
            revisions = [{
              revision: 0,
              files: files,
              label: "Original",
            }];
          }
        }
      } catch (err) {
        console.error("Failed to parse profiting_file JSON:", err);
      }
    }

    return NextResponse.json({ success: true, files, revisions });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
