import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.join(__dirname, "..", "app", "api");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else if (name === "route.js") acc.push(p);
  }
  return acc;
}

const insert = `\nexport const dynamic = "force-dynamic";\n`;
let updated = 0;

for (const file of walk(apiRoot)) {
  let t = fs.readFileSync(file, "utf8");
  if (/export const dynamic\s*=/.test(t)) continue;

  const lines = t.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
  }
  if (lastImport === -1) continue;

  const nextLines = [
    ...lines.slice(0, lastImport + 1),
    insert.trimEnd(),
    ...lines.slice(lastImport + 1),
  ];
  const out = nextLines.join("\n");
  fs.writeFileSync(file, out.endsWith("\n") ? out : `${out}\n`);
  updated++;
}

console.log(`Updated ${updated} route.js files with force-dynamic`);
