const fs = require("fs");
const path = require("path");

const FORBIDDEN_STRINGS = [
  "mixpanel",
  "google-analytics",
  "sentry.io",
  "hotjar",
  "segment.io",
  "logrocket",
  "telemetry",
  "amplitude",
];

function scanDir(dir, fileCallback) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, fileCallback);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileCallback(fullPath);
    }
  });
}

let violations = 0;
console.log("Starting Outbound Telemetry and Tracking Audit...");

scanDir(path.resolve(__dirname, "../src"), (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  FORBIDDEN_STRINGS.forEach((term) => {
    if (content.toLowerCase().includes(term)) {
      console.error(`VIOLATION: Forbidden telemetry string "${term}" located in: ${filePath}`);
      violations++;
    }
  });
});

if (violations > 0) {
  console.error(`Audit Failed: ${violations} telemetry leakage indicators found.`);
  process.exit(1);
} else {
  console.log("Telemetry Audit Passed: No tracking vectors detected in source directories.");
  process.exit(0);
}
