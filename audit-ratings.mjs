#!/usr/bin/env node
// audit-ratings.mjs — balance audit for Eternal City
// Replicates the game's draft + trial math from eternal-city-cards.csv and
// Monte Carlos win rates under different drafting strategies, then scans
// every era/region pool for pick quality.
// Usage: node audit-ratings.mjs [runs-per-strategy]

import { readFileSync } from "fs";

const N = Number(process.argv[2]) || 200000;

// --- CSV parser (same as csv-to-data.mjs) ---
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

// --- game constants (mirror eternal-city.jsx) ---
const ERAS = ["ancient", "medieval", "renaissance", "earlymodern", "industrial", "early20", "postwar", "contemporary"];
const REGIONS = ["EU", "EA", "SA", "ME", "AF", "AM"];
const STAT_LABELS = ["Scale", "Wealth", "Culture", "Knowledge", "Might"];
const TRIAL_STATS = [[3,0],[4],[0,1],[1],[2],[2,4],[3],[4,2],[1,3],[0,1],[4,0],[2,3],[0,3],[0,4]];
const LADDER = [58, 62, 66, 70, 74, 78, 82, 85, 88, 92];
const SAME_CITY = {
  edo: "tokyo", constantinople: "istanbul", bombay: "mumbai", batavia: "jakarta",
  tenochtitlan: "mexico city", calcutta: "kolkata", madras: "chennai", rangoon: "yangon",
  "chang'an": "xi'an",
};

// --- load cities ---
const rows = parseCSV(readFileSync("eternal-city-cards.csv", "utf8"));
const CITIES = rows.slice(1).filter((r) => r.length > 1).map((r) => {
  const name = r[2].trim();
  const k = name.toLowerCase();
  return {
    name, era: r[0].trim(), region: r[1].trim(),
    s: [r[4], r[5], r[6], r[7], r[8]].map(Number),
    cityKey: SAME_CITY[k] || k,
  };
});

// --- game mechanics ---
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const poolFor = (era, region, usedKeys) =>
  CITIES.filter((c) => c.era === era && c.region === region && !usedKeys.has(c.cityKey));

function pickRegion(era, usedKeys, exclude) {
  const order = shuffle(REGIONS);
  for (const r of order) {
    if (r === exclude) continue;
    if (poolFor(era, r, usedKeys).length >= 2) return r;
  }
  return order.find((r) => poolFor(era, r, usedKeys).length >= 1) || order[0];
}

// strategy(pool, openSlots) -> { city, slot }
function draft(strategy) {
  const eras = shuffle(ERAS).slice(0, 5);
  const empty = new Set();
  const rounds = eras.map((era) => ({ era, region: pickRegion(era, empty, null) }));
  const used = new Set();
  const team = [0, 0, 0, 0, 0];
  let open = [0, 1, 2, 3, 4];
  for (const r of rounds) {
    const pool = poolFor(r.era, r.region, used);
    if (!pool.length) return null; // soft-lock: pool emptied by same-city locks
    const { city, slot } = strategy(pool, open);
    team[slot] = city.s[slot];
    used.add(city.cityKey);
    open = open.filter((s) => s !== slot);
  }
  return team;
}

function runTrials(team) {
  const deck = shuffle(TRIAL_STATS).slice(0, 10);
  const ladder = shuffle(LADDER);
  let survived = 0, wounds = 0;
  for (let i = 0; i < deck.length; i++) {
    const stats = deck[i];
    const score = Math.round(stats.reduce((a, s) => a + team[s], 0) / stats.length);
    const roll = Math.floor(Math.random() * 21) - 10;
    if (score + roll >= ladder[i]) survived++;
    else if (++wounds === 2) break;
  }
  return { survived, wounds };
}

const STRATEGIES = {
  "random        ": (pool, open) => ({
    city: pool[Math.floor(Math.random() * pool.length)],
    slot: open[Math.floor(Math.random() * open.length)],
  }),
  "greedy        ": (pool, open) => {
    let best = null, bv = -1;
    for (const city of pool) for (const slot of open)
      if (city.s[slot] > bv) { bv = city.s[slot]; best = { city, slot }; }
    return best;
  },
  // greedy, but protects scarce slots: value = stat minus what the rest of the
  // pool could still give that slot (crude marginal-value heuristic)
  "greedy+balance": (pool, open) => {
    let best = null, bv = -Infinity;
    for (const city of pool) for (const slot of open) {
      const alt = Math.max(...pool.filter((c) => c !== city).map((c) => c.s[slot]), 0);
      const v = city.s[slot] + (city.s[slot] - alt) * 0.5;
      if (v > bv) { bv = v; best = { city, slot }; }
    }
    return best;
  },
};

console.log(`=== Monte Carlo: ${N.toLocaleString()} runs per strategy ===\n`);
console.log("strategy        eternal   9+ cent.  avg yrs  med yrs  collapse  softlock");
for (const [name, strat] of Object.entries(STRATEGIES)) {
  let eternal = 0, nine = 0, collapse = 0, softlock = 0, total = 0;
  const hist = Array(11).fill(0);
  for (let i = 0; i < N; i++) {
    const team = draft(strat);
    if (!team) { softlock++; continue; }
    const { survived, wounds } = runTrials(team);
    hist[survived]++;
    total += survived;
    if (survived === 10) eternal++;
    if (survived >= 9) nine++;
    if (wounds >= 2) collapse++;
  }
  const ok = N - softlock;
  let acc = 0, med = 0;
  for (let s = 0; s <= 10; s++) { acc += hist[s]; if (acc >= ok / 2) { med = s; break; } }
  console.log(
    `${name}  ${(100 * eternal / ok).toFixed(2).padStart(6)}%  ` +
    `${(100 * nine / ok).toFixed(1).padStart(7)}%  ` +
    `${(100 * total / ok).toFixed(0).padStart(7)}  ${String(med * 100).padStart(7)}  ` +
    `${(100 * collapse / ok).toFixed(1).padStart(7)}%  ${String(softlock).padStart(8)}`
  );
}

// --- theoretical ceiling: P(eternal) for a perfect 99x5 roster ---
{
  let wins = 0;
  const M = 2_000_000;
  for (let i = 0; i < M; i++) {
    const ladder = shuffle(LADDER);
    let ok = true;
    for (let j = 0; j < 10 && ok; j++)
      if (99 + Math.floor(Math.random() * 21) - 10 < ladder[j]) ok = false;
    if (ok) wins++;
  }
  console.log(`\nceiling: flawless 99/99/99/99/99 roster goes eternal ${(100 * wins / M).toFixed(1)}% of the time`);
  console.log("(the 92-difficulty century alone fails a 99 stat 2/21 of the time)");
}

// --- per-pool quality scan ---
console.log("\n=== Pool quality (best available rating per stat) ===");
console.log("flagging pools whose best single stat < 80 (no great pick = reroll bait)\n");
const weak = [];
for (const era of ERAS) {
  for (const region of REGIONS) {
    const pool = CITIES.filter((c) => c.era === era && c.region === region);
    const best = [0, 1, 2, 3, 4].map((i) => Math.max(...pool.map((c) => c.s[i])));
    const top = Math.max(...best);
    const great = best.filter((v) => v >= 85).length;
    if (top < 80) weak.push({ era, region, best, top });
    console.log(
      `${era.padEnd(13)} ${region}  best: ${best.map((v) => String(v).padStart(2)).join(" ")}  ` +
      `peak ${top}  slots>=85: ${great}${top < 80 ? "  << NO GREAT PICK" : ""}`
    );
  }
}
console.log(`\n${weak.length} of 48 pools have no stat above 79:`);
for (const w of weak) console.log(`  ${w.era}/${w.region}  peak ${w.top} (${STAT_LABELS[w.best.indexOf(w.top)]})`);
