#!/usr/bin/env node
// csv-to-data.mjs — regenerate the CITIES data in eternal-city.jsx from eternal-city-cards.csv
// Usage:  node csv-to-data.mjs [cards.csv] [game.jsx]
// Edit ratings in the CSV (Excel/Google Sheets, export as CSV), run this, done.

import { readFileSync, writeFileSync } from "fs";

const csvPath = process.argv[2] || "eternal-city-cards.csv";
const jsxPath = process.argv[3] || "eternal-city.jsx";

// --- tiny CSV parser (handles quoted fields with commas and "" escapes) ---
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (field || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (ch === "\r" && text[i + 1] === "\n") i++;
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const ERAS = ["ancient", "medieval", "renaissance", "earlymodern", "industrial", "early20", "postwar", "contemporary"];
const REGIONS = ["EU", "EA", "SA", "ME", "AF", "AM"];

const rows = parseCSV(readFileSync(csvPath, "utf8"));
const header = rows[0].map((h) => h.trim().toLowerCase());
const idx = (name) => {
  const i = header.indexOf(name);
  if (i === -1) throw new Error(`CSV missing column: ${name}`);
  return i;
};
const col = {
  era: idx("era"), region: idx("region"), name: idx("name"), epithet: idx("epithet"),
  scale: idx("scale"), wealth: idx("wealth"), culture: idx("culture"),
  knowledge: idx("knowledge"), might: idx("might"), tagline: idx("tagline"),
};

// --- validate every row before touching the game file ---
const errors = [];
const cards = rows.slice(1).filter((r) => r.length > 1).map((r, n) => {
  const line = n + 2;
  const era = r[col.era].trim(), region = r[col.region].trim();
  if (!ERAS.includes(era)) errors.push(`row ${line}: unknown era "${era}"`);
  if (!REGIONS.includes(region)) errors.push(`row ${line}: unknown region "${region}"`);
  const s = [col.scale, col.wealth, col.culture, col.knowledge, col.might].map((c) => {
    const v = Number(r[c]);
    if (!Number.isInteger(v) || v < 0 || v > 99) errors.push(`row ${line}: stat out of range (${r[c]})`);
    return v;
  });
  if (!r[col.name].trim()) errors.push(`row ${line}: empty city name`);
  return { name: r[col.name].trim(), ep: r[col.epithet].trim(), era, region, s, tag: r[col.tagline].trim() };
});

// pool-size guarantee: every era x region needs >= 2 cards (4+ recommended)
for (const e of ERAS) for (const g of REGIONS) {
  const c = cards.filter((x) => x.era === e && x.region === g).length;
  if (c < 2) errors.push(`pool too thin: ${e}/${g} has ${c} card(s) — minimum 2, recommend 4+`);
}

if (errors.length) {
  console.error("VALIDATION FAILED — game file not modified:\n" + errors.join("\n"));
  process.exit(1);
}

// --- regenerate the data block between the markers ---
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const lines = cards.map((c) =>
  `  { name: "${esc(c.name)}", ep: "${esc(c.ep)}", era: "${c.era}", region: "${c.region}", s: [${c.s.join(", ")}], tag: "${esc(c.tag)}" },`
);
const block = `// >>> CITY DATA START (managed by csv-to-data.mjs — edit eternal-city-cards.csv instead)
const CITIES = [
${lines.join("\n")}
].map((c, i) => ({ ...c, id: i }));
// <<< CITY DATA END`;

const jsx = readFileSync(jsxPath, "utf8");
const MARKERS = /\/\/ >>> CITY DATA START[\s\S]*?\/\/ <<< CITY DATA END/;
if (!MARKERS.test(jsx)) {
  console.error("Markers not found in " + jsxPath);
  process.exit(1);
}
const updated = jsx.replace(MARKERS, block);
writeFileSync(jsxPath, updated);
console.log(updated === jsx
  ? `OK: no changes needed — CSV already matches the ${cards.length} cards in ${jsxPath}`
  : `OK: ${cards.length} cards written into ${jsxPath}`);
