# Ratings & Balance Notes

How city ratings are assigned, and what the balance audit (`node audit-ratings.mjs`) says about them. Data lives in `eternal-city-cards.csv`; regenerate the game with `node csv-to-data.mjs`.

## Rating rubric

All five stats (Scale, Wealth, Culture, Knowledge, Might) are 0–99, era-adjusted: a city is rated against its own world, not ours.

| band | meaning |
|---|---|
| 95–99 | defines the world standard for that era in that dimension (Victorian London's Might, Abbasid Baghdad's Knowledge) |
| 85–94 | front rank globally |
| 70–84 | major regional power |
| 50–69 | significant regional center |
| 30–49 | notable but minor |

Evidence weighed per dimension:

- **Scale** — population relative to the era's largest cities
- **Wealth** — trade volume, markets, treasury
- **Culture** — surviving artistic, literary, and musical footprint
- **Knowledge** — institutions, scholarship, science
- **Might** — armies, walls, imperial reach

Expansion cards (the 55 added in June 2026) are deliberately second-tier, mostly 40s–80s with a few specialist spikes (Bukhara 88 Knowledge, Kamakura 82 Might). They add floor to thin pools, not ceiling, so flagship cities keep their value.

## Regions (since the 13-region split)

The original 6 regions were split into 13 so pools are thin and rerolls matter:
Western Europe, Southern Europe, Central & Eastern Europe, China & Taiwan,
Japan & Korea, South Asia, Southeast Asia, Middle East & Central Asia,
North Africa, West & Central Africa, East & Southern Africa, North America,
Latin America.

Pool rules: an era/region cell may be empty (it is simply never dealt), but a
cell with exactly 1 card is forbidden because the dealer requires 2+ cards, so
the lone card would be unreachable; `csv-to-data.mjs` validates this. If
same-city locks empty a dealt pool mid-draft, the game redraws the region for
free without consuming the player's reroll.

## Audit results (150k simulated runs per strategy, 13 regions)

| strategy | eternal | 900+ yrs | median | collapse |
|---|---|---|---|---|
| pure random (random city, random slot) | 0.14% | 1.0% | 100 yrs | 99.0% |
| sharp play (best available stat each round) | ~8.4% | 28% | 500 yrs | 72% |
| ceiling (99 in every slot) | 85.8% | — | — | — |

Before the split, sharp play went eternal ~24% of the time with a median of
900 years. Fragmenting the regions cut that to ~8% and 500 years.

Key facts:

- The 92-difficulty century requires an effective score of 82+ to be passable at all; even a 99 stat fails it 2 times in 21. Perfection loses ~1 run in 7 to fortune alone.
- Scale is tested in 6 of 14 trials; Knowledge and Might in 5; Wealth and Culture in 4. The Scale slot is the most important to protect.
- Real expert play (rerolls, two-stat trial awareness) lands somewhat above the 24% greedy figure.

Levers if eternal should be rarer: add a 95 rung to the difficulty ladder, tighten fortune to ±8, or make two-stat trials use the lower stat instead of the average.

## Trap pools (by design)

Rerolls are strategic because some era/region draws have no great pick. Under
the 13-region split, 14 of the dealt pools have no stat above 79, including
ancient/Western Europe, medieval/North America, medieval and early modern
West & Central Africa, renaissance and postwar East & Southern Africa, and
early20/Middle East & Central Asia. Run `node audit-ratings.mjs` for the full
current grid; the trap list shifts whenever ratings or cards change.
