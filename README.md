# Claude Cloud Payroll · 108 countries

Employee Central Payroll learning workbooks, one per country (108 countries in all), each expanded to **108 core sections + 9 learning tools** (quiz, crossword, snakes & ladders, AVG wall, flashcards, sticky notes, sequence sprint, match-up, PlayLab Arcade).

Open `index.html` (the GitHub Pages site) and pick a country, or open a workbook directly, for example `India.html`.

| Sections | Part |
|---|---|
| 1–54 | Country standard (baseline, configuration, payroll rules, integration, governance) |
| 55–81 | **Payroll Control Center** detailed configuration (27 sections) |
| 82–108 | **EC → ECP point-to-point replication** detailed steps (27 sections) |

Every new section has: what and why, 4–5 steps, a configuration and evidence sheet, a country learning application, a worked synthetic example, an applied exercise, evidence criteria and reflections.

## Countries
107 countries come from the existing 54-section country workbooks (62 original, 3 main-chapter and 42 appendix-based baselines). **Zambia** is the 108th, added as the 108th Workbook Edition. It is not listed in SAP's 2H 2026 country-specifics document, so it was built from public authority pages (ZRA, NAPSA, NHIMA) with no rates or bands preloaded; confirm support in your own release.

There is a single edition, the Essentials Edition (Gold Edition), and every country has all 108 core sections and 9 learning tools. 42 countries (for example Angola, Kosovo, Vietnam) started from an appendix-only baseline with no currency and no statutory calculation. Their worked examples use the ISO test currency code `XTS`.

## Evidence boundary
Examples use fictional workers (`TEST-<country code>-001` to `004`) and arbitrary amounts. Object names (for example `HRSFEC_PTP_CONFIG`, `PYC_CONFIG_WORKBENCH`) are a design and learning checklist: **confirm each in your own release**. Nothing was executed in a tenant. No affiliation with SAP is claimed.

## Rebuild
```bash
python3 tools/playlab/build_engine.py   # arcade engine
python3 tools/extend_to_108.py          # every country: tools/base/<Country>_54.html.gz -> <Country>.html
python3 tools/extend_to_108.py Germany  # one country
python3 tools/build_hub.py              # index.html
```
* `tools/base/` holds each country's 54-section baseline (gzip). `tools/spec_pcc.py` and `tools/spec_p2p.py` hold the shared sections 55–108.
* `tools/localize.py` swaps the shared India-authored wording (country, code, currency, learner, city, statutory phrases) for each country's own case data. The India edition keeps its own wording.
* The sections 55–108 are the same product-level content for every country. Only the names, identifiers and the worked-example wording change; the statutory content of sections 1–54 is each country's own.
* Change `CORE` in the script only if the section standard changes.

## PlayLab Arcade
The arcade follows the PlayLab 108 universal game standard (`nbnayak88/PlayLab-108`). All 108 templates are playable with the ECP content pack (12 families × 9; pack id `employee-central-payroll.<country>.v1`). Each game has a start screen, rules, scoring from 100, a finite end state, retry, an untimed accessible mode and a stored result record. Engine: `tools/playlab/`. Scenarios are fictional; a game score is not a certification.

Automated checks used for the release: every game is auto-played to a win on three seeds, and every game is fuzzed with random clicks and input in untimed and timed modes. Puzzle data (crossword, logic grids, nonograms, binary grids, schedules, numbers) is verified solvable when the pack is built (`tools/playlab/arcade_pack2.py`). These are automated tests, not human playtesting.

## Colour system (ColorsLab-108)

Every workbook and the hub use the country's two-stop gradient from [nbnayak88/ColorsLab-108](https://github.com/nbnayak88/ColorsLab-108)
(`tools/colorslab-108.json`, copied from commit 8681b04; `tools/colorslab.py` builds the theme CSS). Gradient direction is
`linear-gradient(110deg, start 0%, end 100%)`, hero text is dark ink checked at 4.5:1 or better against both stops, buttons are solid blue
`#1263B4`, and the palettes are a design proposal, not official flag colours. Turkey uses the Türkiye palette and Czech Republic uses Czechia.

## HR Streams Lab

`/hr-lab/` runs the PlayLab arcade of 108 games across the 12 streams of HR (HR01–HR12, Workforce theme). Each stream has its own content pack; HR07 Payroll reuses the payroll case. Build with `python3 tools/hr_lab/build_hr_lab.py`. Packs are generated from per-stream lexicons (`tools/hr_lab/hrspec_hr*.py`) by `tools/hr_lab/hrgen.py`. All 108 games × 12 streams pass the automated auto-play test. Content is v1: many derived games are formulaic.

## CX Streams Lab

`/cx-lab/` runs the same 108-game PlayLab arcade across the 12 customer-experience streams (CX01–CX12). Each stream has its own content pack: vocabulary, quizzes, flows, issues and data fields. Build with `LAB=cx python3 tools/hr_lab/build_hr_lab.py`. Lexicons live in `tools/hr_lab/hrspec_cx01.py` … `hrspec_cx12.py`.

## Finance Streams Lab

`/fi-lab/` runs the same 108-game PlayLab arcade across the 12 finance streams (FI01–FI12). Build with `LAB=fi python3 tools/hr_lab/build_hr_lab.py`. Lexicons live in `tools/hr_lab/hrspec_fi01.py` … `hrspec_fi12.py`.

## Procurement Streams Lab

`/pr-lab/` mirrors the arcade for the 12 Procurement streams (strategy, sourcing, contracts, supplier relationships, procure to pay, resilient supply, supplier quality, spend optimization, risk and sustainability, intelligence, AI, connected procurement), each with 108 games and its own content pack. Build with `LAB=pr python3 tools/hr_lab/build_hr_lab.py`.
