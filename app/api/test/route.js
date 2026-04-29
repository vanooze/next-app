import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testPath = "D:/ProjectUploads/test.txt";

    // Try to create directory if it doesn't exist
    const dir = path.dirname(testPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Try to write a small test file
    fs.writeFileSync(testPath, "write test successful");

    return Response.json({ success: true, message: "✅ D: is writable" });
  } catch (err) {
    console.error("D: access test failed:", err);
    return Response.json({ success: false, error: err.message });
  }
}
