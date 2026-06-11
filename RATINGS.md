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

## Audit results (200k simulated runs per strategy)

| strategy | eternal | 900+ yrs | median | collapse |
|---|---|---|---|---|
| pure random (random city, random slot) | 0.15% | 1.1% | 100 yrs | 98.9% |
| casual (random city, its best slot) | 1.2% | 6.0% | ~200 yrs | 94.0% |
| sharp play (best available stat each round) | ~24% | 59% | 900 yrs | 41% |
| ceiling (99 in every slot) | 85.8% | — | — | — |

Key facts:

- The 92-difficulty century requires an effective score of 82+ to be passable at all; even a 99 stat fails it 2 times in 21. Perfection loses ~1 run in 7 to fortune alone.
- Scale is tested in 6 of 14 trials; Knowledge and Might in 5; Wealth and Culture in 4. The Scale slot is the most important to protect.
- Real expert play (rerolls, two-stat trial awareness) lands somewhat above the 24% greedy figure.

Levers if eternal should be rarer: add a 95 rung to the difficulty ladder, tighten fortune to ±8, or make two-stat trials use the lower stat instead of the average.

## Trap pools (by design)

Rerolls are strategic because some era/region draws have no great pick.

Hard traps, no stat above 79:

- **medieval / Americas** — peak 76 (Tikal's Culture)
- **early modern / Sub-Saharan Africa** — peak 72 (Kano's Wealth)

Soft traps, nothing at 85+: ancient/AF (peak 80), industrial/AF (84), early20/AF (84). Industrial/ME and early20/ME each hold exactly one 85+ option.

Sub-Saharan Africa is the reroll-bait region in most pre-contemporary eras; with regions dealt uniformly, roughly 60% of games face at least one AF pool, so the reroll decision comes up most days. Every era/region pool holds at least 6 cities (target band 6–12).
