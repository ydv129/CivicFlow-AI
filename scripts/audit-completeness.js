const fs = require("fs");
const path = require("path");

const PLACEHOLDER_PATTERNS = [
  /TODO/i,
  /FIXME/i,
  /\/\/ \.\.\./,
  /\/\* \.\.\. \*\//,
  /stub implementation/i,
  /insert code here/i,
];

function isBenignPlaceholderLine(line) {
  // HTML/JSX attribute: placeholder="..." or placeholder={...}
  if (/placeholder[=:{]/.test(line)) return true;
  // Tailwind placeholder color utility: placeholder-zinc-500, placeholder-[color:...]
  if (/placeholder-[a-zA-Z\[]/.test(line)) return true;
  return false;
}

function scanDir(dir, fileCallback) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, fileCallback);
    } else if (/\.(ts|tsx|js|css)$/.test(file)) {
      fileCallback(fullPath);
    }
  });
}

let codeIssues = 0;
console.log("Starting Code Completeness and Placeholder Audit...");

scanDir(path.resolve(__dirname, "../src"), (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    if (/placeholder/i.test(line) && !isBenignPlaceholderLine(line)) {
      console.error(`INCOMPLETE CODE WARNING: Pattern match /placeholder/i found in ${filePath} at line ${index + 1}:`);
      console.error(`  > ${line.trim()}`);
      codeIssues++;
    }

    PLACEHOLDER_PATTERNS.forEach((pattern) => {
      if (pattern.test(line)) {
        console.error(`INCOMPLETE CODE WARNING: Pattern match ${pattern} found in ${filePath} at line ${index + 1}:`);
        console.error(`  > ${line.trim()}`);
        codeIssues++;
      }
    });
  });
});

if (codeIssues > 0) {
  console.error(`Completeness Audit Failed: ${codeIssues} incomplete structures found. Resolve all placeholders before deployment.`);
  process.exit(1);
} else {
  console.log("Completeness Audit Passed: No dynamic stubs or placeholder indicators located.");
  process.exit(0);
}
