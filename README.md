# Claude Cloud Payroll · India test edition

Employee Central Payroll learning workbook for India, expanded to **108 core sections + 9 learning tools (quiz, crossword, snakes & ladders, AVG wall, flashcards, sticky notes, sequence sprint, match-up, PlayLab Arcade)**.

| Sections | Part |
|---|---|
| 1–54 | Existing standard (country baseline, configuration, payroll rules, integration, governance, plus the six sections 49–54) |
| 55–81 | **Payroll Control Center** detailed configuration (27 sections) |
| 82–108 | **EC → ECP point-to-point replication** detailed steps (27 sections) |

Open `India.html` (or the GitHub Pages site). Each new section has: what and why, 4–5 steps, a configuration and evidence sheet naming the transactions, programs, tables and menu paths, an India learning application, an applied exercise, evidence criteria, synthetic case data and reflections.

## Evidence boundary
Object names (for example `HRSFEC_PTP_CONFIG`, `PYC_CONFIG_WORKBENCH`, `HCM_LOC_CI_*`) come from the 25 public SAP sources listed in the workbook's Evidence desk, reviewed 8 November 2026. They are a design and learning checklist: **confirm each in your own release**. Nothing was executed in a tenant. Examples use fictional India workers (TEST-IN-001 to 004). No affiliation with SAP is claimed.

## Rebuild
```bash
python3 tools/extend_to_108.py   # tools/base/India_54.html + tools/spec_pcc.py + tools/spec_p2p.py -> India.html
```
Content lives in `tools/spec_pcc.py` and `tools/spec_p2p.py`. Change `CORE` in the script only if the section standard changes.

## Next
After approval of this India edition, the same two parts can be generated for the other country workbooks in `nbnayak88/payroll`.

## PlayLab Arcade (wave 1)

The arcade follows the PlayLab 108 universal game standard (`nbnayak88/PlayLab-108`). All 108 templates are listed; **36 are playable** (3 per family) and the other 72 are marked "Design only", as the standard requires. Engine: `tools/playlab/` (generic runtime, content pack `employee-central-payroll.india.v1`). Rebuild with `python3 tools/playlab/build_engine.py && python3 tools/extend_to_108.py`. Scenarios are fictional; a game score is not a certification.
