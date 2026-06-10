# Eternal City

A daily draft game: history deals you five random era-and-region combinations; you take a
single attribute from a single city in each; your amalgam civilization then faces ten trials.
Survive all ten — 1,000 years — and you've built an Eternal City.

## Files

| File | What it is |
|---|---|
| `eternal-city.jsx` | The game (single React component, all data + logic) |
| `eternal-city.html` | Standalone playable build — open in any browser, fully self-contained |
| `eternal-city-cards.csv` | Canonical card database — **edit ratings here, not in code** |
| `eternal-city-ratings.xlsx` | Audit workbook: cards + pool-size matrix + per-era stat leaders |
| `csv-to-data.mjs` | Imports the CSV back into the game code |

## Ratings workflow

1. Open `eternal-city-cards.csv` in Google Sheets or Excel (or use the `.xlsx` for audit views)
2. Edit ratings / taglines / add or delete card rows (keep columns intact)
3. Export/save as CSV back to `eternal-city-cards.csv`
4. Run `node csv-to-data.mjs` — it validates everything (eras, regions, 0–99 ranges,
   minimum pool sizes) and refuses to touch the game file if anything's wrong
5. Rebuild (`npm run build` once the Vite project exists, or re-bundle the HTML)

## Dev setup (one time)

```bash
npm create vite@latest eternal-city-site -- --template react
cd eternal-city-site && npm install
# copy eternal-city.jsx over src/App.jsx, copy csv + script into the folder
npm run dev        # local test environment at localhost:5173
npm run build      # production build in dist/ — deploy this folder
```

## Game design knobs (all in `eternal-city.jsx`)

- **Trial difficulty ladder**: `[58, 62, 66, 70, 74, 78, 82, 85, 88, 92]` in `runSim`
- **Fortune range**: `Math.floor(rnd() * 21) - 10` (±10)
- **Dark Age count**: `wounds === 1` (one free failure)
- **Trial deck**: the `TRIALS` array — add archetypes freely; `stats` indexes [SCL, WLT, CUL, KNW, MGT]
