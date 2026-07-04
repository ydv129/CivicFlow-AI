const fs = require("fs");
const path = require("path");

const source = path.resolve(__dirname, "../node_modules/xlsx/dist/xlsx.full.min.js");
const targetDir = path.resolve(__dirname, "../public/lib");
const target = path.join(targetDir, "xlsx.full.min.js");

if (!fs.existsSync(source)) {
  console.warn("xlsx package not found; skipping local SheetJS copy.");
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(source, target);
console.log("Copied xlsx.full.min.js to public/lib/");
