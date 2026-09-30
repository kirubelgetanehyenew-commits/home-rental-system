const fs = require("fs");
const p = "client/src/context/LanguageContext.jsx";
let s = fs.readFileSync(p, "utf8");

// AM values built from chart-verified Ethiopic codepoints
const loadError = "\u1218\u1228\u1303\u12CD\u1295 \u1218\u132B\u1295 \u12A0\u120D\u1270\u127B\u1208\u121D"; // mehchajawun mechhan altechalem
const retry = "\u12A5\u1295\u12F0\u1308\u1293 \u121E\u12AD\u122D"; // endegena mokr
const refresh = "\u12A5\u12F5\u1235"; // eds

// Insert after the LAST (Amharic) occurrence of "admin.breakdown" entry
const anchor = '"admin.breakdown":';
const idx = s.lastIndexOf(anchor);
if (idx === -1) { console.error("anchor not found"); process.exit(1); }
const lineEnd = s.indexOf("\n", idx);
if (lineEnd === -1) { console.error("line end not found"); process.exit(1); }

const eol = s[lineEnd - 1] === "\r" ? "\r\n" : "\n";
const insertAt = s[lineEnd - 1] === "\r" ? lineEnd - 1 : lineEnd;

const addition =
  `${eol}    "admin.loadError": "${loadError}",` +
  `${eol}    "admin.retry": "${retry}",` +
  `${eol}    "admin.refresh": "${refresh}",`;

s = s.slice(0, insertAt) + addition + s.slice(insertAt);
fs.writeFileSync(p, s, "utf8");

// Codepoint report for verification
const report = [];
for (const [k, v] of [["loadError", loadError], ["retry", retry], ["refresh", refresh]]) {
  report.push(k + ": " + [...v].map((c) => c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join(" "));
}
for (const key of ["admin.loadError", "admin.retry", "admin.refresh"]) {
  const count = s.split(`"${key}"`).length - 1;
  report.push(`occurrences of ${key}: ${count}`);
}
fs.writeFileSync("cp-report.txt", report.join("\n"), "utf8");
console.log("done");
