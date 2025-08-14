import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { projectId, data } = await req.json();

  if (!projectId || !Array.isArray(data)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const tempIdMap = new Map();
    const incomingIds = new Set();
    const isTempId = (id) => !id || String(id).startsWith("temp-");

    const existingRows = await executeQuery(
      `SELECT id FROM gannt_chart WHERE project_id = ?`,
      [projectId]
    );
    const existingIds = new Set(existingRows.map((row) => row.id));

    // Handle parents
    for (const row of data) {
      if (row.parent_id) continue;

      const isNew = isTempId(row.id);
      const {
        title,
        start_date,
        end_date,
        actual_start_date,
        actual_end_date,
      } = row;

      if (isNew) {
        const [existing] = await executeQuery(
          `SELECT id FROM gannt_chart 
           WHERE project_id = ? AND title = ? AND start_date = ? AND end_date = ? AND parent_id IS NULL`,
          [projectId, title, start_date, end_date]
        );

        if (existing?.id) {
          // Update actuals even if duplicate is found
          await executeQuery(
            `UPDATE gannt_chart 
             SET actual_start_date = ?, actual_end_date = ?, updated_at = ?
             WHERE id = ?`,
            [
              actual_start_date || null,
              actual_end_date || null,
              now,
              existing.id,
            ]
          );
          tempIdMap.set(row.id, existing.id);
          incomingIds.add(existing.id);
          continue;
        }

        const result = await executeQuery(
          `INSERT INTO gannt_chart 
           (project_id, title, start_date, end_date, actual_start_date, actual_end_date, progress, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
          [
            projectId,
            title,
            start_date,
            end_date,
            actual_start_date || null,
            actual_end_date || null,
            now,
            now,
          ]
        );
        tempIdMap.set(row.id, result.insertId);
        incomingIds.add(result.insertId);
      } else {
        await executeQuery(
          `UPDATE gannt_chart 
           SET title = ?, start_date = ?, end_date = ?, actual_start_date = ?, actual_end_date = ?, updated_at = ?
           WHERE id = ? AND project_id = ?`,
          [
            title,
            start_date,
            end_date,
            actual_start_date || null,
            actual_end_date || null,
            now,
            row.id,
            projectId,
          ]
        );
        tempIdMap.set(row.id, row.id);
        incomingIds.add(row.id);
      }
    }

    // Handle children
    for (const row of data) {
      if (!row.parent_id) continue;

      const isNew = isTempId(row.id);
      const actualParentId = tempIdMap.get(row.parent_id) || row.parent_id;

      const {
        title,
        start_date,
        end_date,
        actual_start_date,
        actual_end_date,
      } = row;

      if (!actualParentId) {
        console.warn(`No parent found for ${row.parent_id}`);
        continue;
      }

      if (isNew) {
        const [existing] = await executeQuery(
          `SELECT id FROM gannt_chart 
           WHERE project_id = ? AND parent_id = ? AND title = ? AND start_date = ? AND end_date = ?`,
          [projectId, actualParentId, title, start_date, end_date]
        );

        if (existing?.id) {
          // Update actuals if duplicate found
          await executeQuery(
            `UPDATE gannt_chart 
             SET actual_start_date = ?, actual_end_date = ?, updated_at = ?
             WHERE id = ?`,
            [
              actual_start_date || null,
              actual_end_date || null,
              now,
              existing.id,
            ]
          );
          incomingIds.add(existing.id);
          continue;
        }

        const result = await executeQuery(
          `INSERT INTO gannt_chart 
           (parent_id, project_id, title, start_date, end_date, actual_start_date, actual_end_date, progress, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
          [
            actualParentId,
            projectId,
            title,
            start_date,
            end_date,
            actual_start_date || null,
            actual_end_date || null,
            now,
            now,
          ]
        );
        incomingIds.add(result.insertId);
      } else {
        await executeQuery(
          `UPDATE gannt_chart 
           SET title = ?, start_date = ?, end_date = ?, actual_start_date = ?, actual_end_date = ?, parent_id = ?, updated_at = ?
           WHERE id = ? AND project_id = ?`,
          [
            title,
            start_date,
            end_date,
            actual_start_date || null,
            actual_end_date || null,
            actualParentId,
            now,
            row.id,
            projectId,
          ]
        );
        incomingIds.add(row.id);
      }
    }

    // Delete removed items
    const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));

    if (idsToDelete.length > 0) {
      await executeQuery(
        `DELETE FROM gannt_chart WHERE id IN (${idsToDelete
          .map(() => "?")
          .join(",")})`,
        idsToDelete
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[GANTT POST ERROR]", error);
    return NextResponse.json(
      { error: "Failed to save Gantt data." },
      { status: 500 }
    );
  }
}
