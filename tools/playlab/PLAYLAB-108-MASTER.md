# PlayLab 108 — Universal Game Standards

**Version:** 1.0.0 · **Status:** specification only · **Templates:** 108 · **Game length:** 5–30 minutes

## Purpose

A universal, domain-neutral library of real, finishable games. Every mechanic accepts interchangeable content packs, so the same template works with any industry, sector, product or subject. A course is a *content pack*, not a fork of a game engine. Brand names and subject facts must never be hard-coded into the universal game implementation.

## Mandatory acceptance contract

Every template MUST have: player agency; a visible start; playable actions with rules; challenge or opposition; immediate feedback; objective; scoring; finite win/lose/draw or completion state; configured 5–30-minute maximum standard session; retry/replay; keyboard/touch alternatives where feasible; and an explicit end screen. A plain worksheet, unscored static quiz, certificate, journal, reflection page, teach-back studio or passport is **not** one of the 108 games.

### Game instance specification

```json
{
  "templateId": "PL108-046",
  "templateVersion": "1.0.0",
  "contentPackId": "any-domain.example",
  "contentPackVersion": "1.0.0",
  "locale": "en",
  "sessionMinutes": 20,
  "difficulty": "intermediate",
  "seed": 108,
  "playerMode": "solo",
  "scoring": {"normalizedMax": 100, "hintPenalty": 5},
  "accessibility": {"keyboard": true, "reducedMotion": true}
}
```

### Runtime and authoring separation

1. **Template registry** stores game ID, mechanics, compatible pack schema, controls and finish conditions.
2. **Runtime** handles lifecycle (ready/playing/paused/finished), timer, random seed, scoring, hints, validation, undo, replay and results.
3. **Content pack** supplies subject-specific questions, words, cards, media, tasks, graphs, numbers, explanations and answer keys. Validate pack solvability.
4. **Theme** supplies accessible styling, typography, optional licensed audio and branding.
5. **Admin authoring** must require authenticated server-backed administration; never put passwords or API secrets in public JavaScript or GitHub Pages.
6. **Result adapter** records score, outcome, elapsed time, attempt count, template ID/version and content pack ID/version. Cross-device leaderboards and signed certificates require a backend and verifiable issuance.

### Publishing and safety

Static games can run on GitHub Pages. External services are optional and permissioned. Use synthetic/example data, sanitize untrusted HTML, provide data notices, prevent script injection, validate mathematical rules and copyrighted media rights, support reduced-motion and untimed accessible alternatives. Timers are 5/10/15/20/25/30 minutes; finishing early is allowed.

## Canonical 108-template registry

| ID | Family | Universal game | Player action | Win / finish condition | Default minutes |
|---|---|---|---|---|---:|
| PL108-001 | Quiz Arena | Rapid Fire Quiz | Answer questions against a countdown | Meet the streak and score threshold | 5 |
| PL108-002 | Quiz Arena | Millionaire Challenge | Choose answers while managing lifelines and prize levels | Clear the final level | 10 |
| PL108-003 | Quiz Arena | Jeopardy Board | Choose a category and stake, then answer | Earn the target points before rounds expire | 15 |
| PL108-004 | Quiz Arena | Quiz Wheel | Spin a wheel and answer the selected challenge | Complete the required spins and score target | 20 |
| PL108-005 | Quiz Arena | True-or-False Blitz | Classify time-limited statements | Reach the accuracy threshold | 25 |
| PL108-006 | Quiz Arena | Last Learner Standing | Survive successive elimination questions | Survive the final round | 30 |
| PL108-007 | Quiz Arena | Risk Your Points | Wager earned points before answering | Reach the final points threshold | 5 |
| PL108-008 | Quiz Arena | Trivia Bingo | Answer clues to mark grid cells | Complete a valid bingo line | 10 |
| PL108-009 | Quiz Arena | Quiz Boss Battle | Defeat escalating question bosses with limited lives | Defeat the final boss | 15 |
| PL108-010 | Word Arena | Crossword Challenge | Fill intersecting clue answers on a letter grid | Complete the crossword correctly | 20 |
| PL108-011 | Word Arena | Word Search Hunt | Find hidden terms in a letter matrix | Find all required terms | 25 |
| PL108-012 | Word Arena | Hangman Rescue | Guess letters while managing limited mistakes | Reveal the phrase before attempts run out | 30 |
| PL108-013 | Word Arena | Word Scramble | Reorder letter tiles into terms | Solve the required scrambled terms | 5 |
| PL108-014 | Word Arena | Anagram Race | Discover valid anagrams under time pressure | Clear the target number of rounds | 10 |
| PL108-015 | Word Arena | Word Ladder | Change one letter per move to reach the target word | Reach the destination using legal words | 15 |
| PL108-016 | Word Arena | Missing Letters | Fill gaps in partially hidden terms | Complete the set within the error budget | 20 |
| PL108-017 | Word Arena | Cryptogram Decoder | Crack a substitution cipher using clues | Decode the complete message | 25 |
| PL108-018 | Word Arena | Codeword Puzzle | Deduce numbered letter substitutions across a grid | Fill every numbered cell correctly | 30 |
| PL108-019 | Board Arena | Snakes & Ladders | Roll a die and move after challenge outcomes | Reach the finish square | 5 |
| PL108-020 | Board Arena | Knowledge Ludo | Move tokens through turns and challenge gates | Bring required tokens home | 10 |
| PL108-021 | Board Arena | Monopoly Simulation | Buy, trade and budget through a turn-based board | Achieve a declared asset or score target | 15 |
| PL108-022 | Board Arena | Trivia Tic-Tac-Toe | Claim cells by solving challenges | Complete three consecutive cells | 20 |
| PL108-023 | Board Arena | Knowledge Connect Four | Claim column slots after a correct response | Connect four tokens | 25 |
| PL108-024 | Board Arena | Checkers Challenge | Advance and capture pieces on a turn board | Capture or immobilize the opponent | 30 |
| PL108-025 | Board Arena | Chess Puzzle Duel | Choose tactical chess moves against puzzle states | Resolve the assigned tactical positions | 5 |
| PL108-026 | Board Arena | Dice Decision Derby | Roll dice and play scenario decision cards | Reach the finish or target score | 10 |
| PL108-027 | Board Arena | Board Race 100 | Move across a 100-square challenge board | Reach square 100 | 15 |
| PL108-028 | Memory Arena | Memory Flip | Reveal concealed cards to discover matches | Match every pair | 20 |
| PL108-029 | Memory Arena | Concept Match | Pair related cards under a time limit | Match all required relationships | 25 |
| PL108-030 | Memory Arena | System Match-Up | Connect two groups of matched concept cards | Complete all unique matches | 30 |
| PL108-031 | Memory Arena | Context Match | Connect a context card with its fitting response | Match the target number of contexts | 5 |
| PL108-032 | Memory Arena | Picture Pair Hunt | Reveal and match visual cards | Clear the picture deck | 10 |
| PL108-033 | Memory Arena | Triple Match | Connect three mutually related cards | Complete every triple | 15 |
| PL108-034 | Memory Arena | Memory Chain | Reproduce an increasing item sequence | Survive the target number of chains | 20 |
| PL108-035 | Memory Arena | Odd One Out | Select anomalous items from sets | Find all anomalies within the mistake limit | 25 |
| PL108-036 | Memory Arena | Matching Marathon | Clear consecutive matching boards | Finish every stage | 30 |
| PL108-037 | Logic Arena | Sudoku Challenge | Fill a constrained number or symbol grid | Satisfy all row, column and box rules | 5 |
| PL108-038 | Logic Arena | Logic Grid Detective | Eliminate possibilities using clue statements | Derive one valid full assignment | 10 |
| PL108-039 | Logic Arena | Mastermind Codebreaker | Guess a hidden sequence and interpret feedback | Crack the secret within allowed guesses | 15 |
| PL108-040 | Logic Arena | Minesweeper | Reveal safe cells using adjacency clues | Reveal all safe cells | 20 |
| PL108-041 | Logic Arena | Nonogram Puzzle | Shade cells from row and column number clues | Complete the intended pixel grid | 25 |
| PL108-042 | Logic Arena | Pattern Predictor | Choose the next item in a pattern series | Solve required pattern rounds | 30 |
| PL108-043 | Logic Arena | Logic Gates | Join gates and signals to reach desired outputs | Match all target outputs | 5 |
| PL108-044 | Logic Arena | Einstein Riddle | Resolve a complex multi-attribute deduction problem | Find the complete consistent solution | 10 |
| PL108-045 | Logic Arena | Binary Puzzle | Fill a grid with binary symbols under constraints | Validate the entire grid | 15 |
| PL108-046 | Adventure Arena | Escape Room | Solve sequential room puzzles to unlock doors | Escape the final room | 20 |
| PL108-047 | Adventure Arena | Treasure Hunt | Follow clues between hidden locations | Discover the final treasure | 25 |
| PL108-048 | Adventure Arena | Mission Quest | Explore stages and complete mandatory objectives | Finish the final mission objective | 30 |
| PL108-049 | Adventure Arena | Mystery Mansion | Investigate rooms and unlock hidden paths | Unlock the final chamber | 5 |
| PL108-050 | Adventure Arena | Labyrinth Escape | Navigate passages and challenge gates | Reach the maze exit | 10 |
| PL108-051 | Adventure Arena | Lost Data Expedition | Recover scattered items through challenge stages | Collect all required fragments | 15 |
| PL108-052 | Adventure Arena | Secret Vault | Solve nested locks and coded combinations | Open the final vault | 20 |
| PL108-053 | Adventure Arena | Island Survival | Choose actions and manage dwindling resources | Reach rescue with resources above zero | 25 |
| PL108-054 | Adventure Arena | Time Travel Rescue | Resolve linked puzzles in branching time periods | Restore the complete timeline | 30 |
| PL108-055 | Arcade Arena | Whack-a-Target | Hit valid moving targets while avoiding decoys | Reach the required hit score | 5 |
| PL108-056 | Arcade Arena | Falling Answers | Catch correct falling objects and dodge wrong ones | Meet the target while lives remain | 10 |
| PL108-057 | Arcade Arena | Knowledge Runner | Run, jump and enter valid challenge lanes | Complete the course | 15 |
| PL108-058 | Arcade Arena | Space Invaders Quiz | Shoot targets that match the prompt | Clear enemy waves | 20 |
| PL108-059 | Arcade Arena | Balloon Pop | Pop correct balloons under a timer | Clear the required balloon rounds | 25 |
| PL108-060 | Arcade Arena | Brick Breaker | Bounce a ball to break rule-driven blocks | Clear all required blocks | 30 |
| PL108-061 | Arcade Arena | Target Shooter | Aim and select correct moving target symbols | Reach the target score | 5 |
| PL108-062 | Arcade Arena | Reaction Racer | Steer through moving decision gates | Finish all laps | 10 |
| PL108-063 | Arcade Arena | Asteroid Defender | Intercept hazardous objects before impact | Defend through the final wave | 15 |
| PL108-064 | Sequence Arena | Sequence Sprint | Reorder shuffled cards into a valid sequence | Submit the complete correct order | 20 |
| PL108-065 | Sequence Arena | Workflow Maze | Choose branches at process decision nodes | Reach a valid workflow end state | 25 |
| PL108-066 | Sequence Arena | Pipeline Builder | Connect components with valid directed edges | Produce a valid end-to-end pipeline | 30 |
| PL108-067 | Sequence Arena | Dependency Dominoes | Place pieces according to prerequisite constraints | Place all pieces legally | 5 |
| PL108-068 | Sequence Arena | Process Jigsaw | Assemble disjointed process segments | Reconstruct the complete flow | 10 |
| PL108-069 | Sequence Arena | Critical Path Race | Sequence tasks under time and dependency constraints | Finish within the simulated deadline | 15 |
| PL108-070 | Sequence Arena | Flowchart Fixer | Repair missing or incorrect routing nodes | Pass all flow validation tests | 20 |
| PL108-071 | Sequence Arena | Bottleneck Buster | Change capacity or sequence to relieve constraints | Meet the throughput target | 25 |
| PL108-072 | Sequence Arena | Approval Relay | Route cases to eligible approving roles | Complete all cases without invalid approval | 30 |
| PL108-073 | Strategy Arena | Operations Tycoon | Manage demand, capacity and quality across rounds | Reach the performance target | 5 |
| PL108-074 | Strategy Arena | Budget Battle | Allocate a limited budget across competing choices | Achieve the objective under budget | 10 |
| PL108-075 | Strategy Arena | Resource Rescue | Assign scarce resources to tasks | Cover all critical tasks within constraints | 15 |
| PL108-076 | Strategy Arena | Network Commander | Move resources through an evolving network | Meet delivery targets over rounds | 20 |
| PL108-077 | Strategy Arena | Factory Scheduler | Schedule jobs and machines to avoid conflicts | Complete required jobs by deadline | 25 |
| PL108-078 | Strategy Arena | Talent Rush | Select characters with balanced abilities for tasks | Build a team that passes the challenge | 30 |
| PL108-079 | Strategy Arena | Compliance Commander | Place controls against evolving risk events | Finish with risk below the threshold | 5 |
| PL108-080 | Strategy Arena | Market Strategy Duel | Select competitive moves over simulated rounds | Outperform the rival score | 10 |
| PL108-081 | Strategy Arena | Crisis Control | Contain escalating hazards with action costs | Restore safe operating conditions | 15 |
| PL108-082 | Mystery Arena | Error Detective | Examine clues and select a root cause | Identify and resolve the correct fault | 20 |
| PL108-083 | Mystery Arena | Log File Hunt | Search timestamped event trails for decisive clues | Identify the failing event chain | 25 |
| PL108-084 | Mystery Arena | Bug Bounty | Inspect a simulated system and fix hidden defects | Resolve the required defects | 30 |
| PL108-085 | Mystery Arena | Data Reconciliation Race | Compare paired records and correct mismatches | Reconcile all target records | 5 |
| PL108-086 | Mystery Arena | Configuration Spotter | Find invalid values inside a mock setup | Locate every required anomaly | 10 |
| PL108-087 | Mystery Arena | Root Cause Ladder | Link evidence into a defensible causal chain | Construct the valid causal path | 15 |
| PL108-088 | Mystery Arena | Fraud Investigator | Examine transactions and evidence for suspicious patterns | Identify the supported case | 20 |
| PL108-089 | Mystery Arena | Integration Rescue | Repair broken simulated data exchanges | Pass the integration test suite | 25 |
| PL108-090 | Mystery Arena | Audit Evidence Hunt | Locate missing evidence in a document collection | Meet the audit evidence checklist | 30 |
| PL108-091 | Visual Arena | Spot the Difference | Compare two images to locate discrepancies | Identify the required differences | 5 |
| PL108-092 | Visual Arena | Architecture Jigsaw | Fit visual fragments into a coherent diagram | Assemble the correct picture | 10 |
| PL108-093 | Visual Arena | Drag-and-Drop Builder | Place labeled objects into valid locations | Complete a constraint-valid layout | 15 |
| PL108-094 | Visual Arena | Map Explorer | Follow location clues across a map | Locate the final destination | 20 |
| PL108-095 | Visual Arena | Visual Memory Grid | Study briefly shown symbols and reconstruct them | Recreate the target pattern | 25 |
| PL108-096 | Visual Arena | Circuit Connector | Rotate and join connectors into a continuous route | Complete the valid circuit | 30 |
| PL108-097 | Visual Arena | Tile Slider | Slide adjacent tiles to restore a target arrangement | Solve the sliding puzzle | 5 |
| PL108-098 | Visual Arena | Network Path Finder | Explore a node graph to identify valid routes | Reach target nodes under path rules | 10 |
| PL108-099 | Visual Arena | Blueprint Repair | Diagnose gaps in a visual blueprint and place corrections | Restore a validated blueprint | 15 |
| PL108-100 | Numbers Arena | Calculation Race | Solve quantitative prompts against the clock | Reach the accuracy and time target | 20 |
| PL108-101 | Numbers Arena | Numbers Puzzle | Combine provided values under explicit rules | Reach the numeric goal | 25 |
| PL108-102 | Numbers Arena | Equation Escape | Solve equations to open sequential locks | Unlock the final door | 30 |
| PL108-103 | Numbers Arena | Number Bingo | Calculate results and mark matching board cells | Complete a bingo line | 5 |
| PL108-104 | Numbers Arena | Cost Optimizer | Adjust parameters under spending constraints | Find a valid low-cost solution | 10 |
| PL108-105 | Numbers Arena | Forecast Challenge | Predict values from a presented sequence or data set | Meet the forecast-error threshold | 15 |
| PL108-106 | Numbers Arena | Percentage Duel | Compute changes, ratios and percentages across rounds | Win the required rounds | 20 |
| PL108-107 | Numbers Arena | Break-Even Battle | Adjust price, costs and quantities in a simulation | Reach the break-even objective | 25 |
| PL108-108 | Numbers Arena | Profit Quest | Manage trade-offs through financial rounds | Achieve the final target surplus | 30 |

## Quality gates for each completed game

- **Mechanics:** Player can start, act, receive feedback, win/lose, and restart; the game is not passive content.
- **Content portability:** Substitute two unrelated topic packs with no changes to core game code.
- **Determinism:** Tests cover both solved and unsolved states, random seed and edge cases.
- **Timing:** Configured standard sessions stay within 5–30 minutes, with early completion and accessible accommodation.
- **Access:** Use keyboard, pointer and touch as appropriate; no color-only correctness cues.
- **Results:** Declare actual completion separately from accuracy and score; show retry and a meaningful summary.
- **Publishing:** Version template and pack separately, validate packs before release, label sample/simulated content accurately.

## Status

All 108 templates are documented as designs; they are **not** claimed to be implemented, tested or live. The examples in `examples/` are replaceable content-pack specifications.
