// Tagless Static Scanner for PhysicsLab
// Scans all source files to verify ZERO HTML markup, ZERO DOM elements, and ZERO prohibited APIs.

import fs from 'fs';
import path from 'path';

const PROHIBITED_PATTERNS = [
  /<div/i,
  /<span/i,
  /<h[1-6]/i,
  /<p\b/i,
  /<img/i,
  /<button/i,
  /<a\b/i,
  /<section/i,
  /<ul/i,
  /<ol/i,
  /<li/i,
  /<table/i,
  /<form/i,
  /<input/i,
  /<select/i,
  /<textarea/i,
  /<nav/i,
  /<footer/i,
  /<main/i,
  /<article/i,
  /<svg/i,
  /innerHTML/i,
  /outerHTML/i,
  /document\.write/i,
  /createElement\s*\(\s*['"`](?!canvas)/i, // only canvas allowed at boot
  /appendChild\s*\(\s*(?!(this\.)?canvas)/i,
  /insertAdjacentHTML/i,
  /dangerouslySetInnerHTML/i
];

const SCAN_DIRS = [
  'physicslab',
  'physics',
  'scenes',
  'engine',
  'main.js',
  'index.js'
];

let totalFilesScanned = 0;
let totalViolations = 0;
const violationsList = [];

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    const files = fs.readdirSync(filePath);
    for (const f of files) {
      scanFile(path.join(filePath, f));
    }
    return;
  }

  if (!filePath.endsWith('.js')) return;
  // Ignore the scanner itself or server.js serving the canvas
  if (filePath.includes('taglessScan.js') || filePath.includes('server.js')) return;

  totalFilesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    for (const pattern of PROHIBITED_PATTERNS) {
      if (pattern.test(line)) {
        totalViolations++;
        violationsList.push({
          file: filePath,
          line: idx + 1,
          pattern: pattern.toString(),
          content: line.trim()
        });
      }
    }
  });
}

console.log('====================================================');
console.log('PHYSICSLAB TAGLESS STATIC VALIDATION SCAN');
console.log('====================================================\n');

for (const target of SCAN_DIRS) {
  const fullPath = path.resolve(process.cwd(), target);
  scanFile(fullPath);
}

console.log(`Scanned ${totalFilesScanned} source files.`);

if (totalViolations === 0) {
  console.log('\n✅ TAGLESS SCAN PASSED: 0 PROHIBITED HTML/DOM MARKUP FOUND.');
  console.log('All rendering and UI is 100% Canvas-rendered.\n');
  process.exit(0);
} else {
  console.error(`\n❌ TAGLESS SCAN FAILED: ${totalViolations} violations found:`);
  for (const v of violationsList) {
    console.error(`  - ${v.file}:${v.line} (${v.pattern}): ${v.content}`);
  }
  process.exit(1);
}
