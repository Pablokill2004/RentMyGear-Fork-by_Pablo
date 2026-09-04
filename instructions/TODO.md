# Plan outcome
All decisions locked in. Final plan:
Execution Plan — "Smart Insurance" Challenge
Phase 0 — Repair baseline (the "100% Base Coverage" requirement)
1. Restore 6 lost files (gear/[id] + category/[id] pages) from the Temp clone using -LiteralPath
2. Install @vitest/coverage-v8 (coverage command currently broken); add testTimeout: 30000 to vitest.config.ts (slow SDK imports caused the 5s timeout)
3. Fix 11 failing tests: 3 date-utils (timezone-safe new Date(2024, 0, 15) constructors), 7 RentalFlow ("Selección de Fechas" → actual UI text "Seleccionar Fechas"), 1 imageService (timeout fixed by config)
4. Verify all 57 tests green + coverage runs
Phase 1 — RED (AI-Driven TDD)
5. Write failing suite first: src/lib/insurance.test.ts (rate 0.20 for fotografia-video, 0.10 for others; fee = dailyRate × days × rate; opt-out = fee 0), PriceSummary/RentalFlow insurance UI tests, extended validation + rental API tests
6. Run tests → confirm failures (TDD satisfied; single commit later per your choice)
Phase 2 — GREEN (implementation)
7. Create src/lib/insurance.ts; add optional insuranceSelected to rental schemas; UI toggle "Protección de Daños" in PriceSummary with fee line + adjusted total; RentalFlow state + POST payload; Confirmation line; rental route computes insuranceFee
Phase 3 — True 100% coverage (all src files, incl. shadcn ui)
8. ~20 new test files: validation, utils, env, inventoryService, storageService (mock GCS), imageService completion (mock Gemini), both API routes, layout, home page (spike: React 19 async server components in RTL; fallback render(await Component(props))), error/loading pages, restored gear/category pages, CategoryButtons, GearGrid, GearImage, HeroCarousel, DateSelection, PriceSummary, Confirmation, and all ui primitives (calendar, carousel included)
9. Iterate until the coverage table shows 100% on lines/branches/functions/statements for every file
Phase 4 — Documentation
10. README.md: feature section, coverage table → 100%, updated rental flow
11. docs/DIAGRAMS.md: new Mermaid diagrams (insurance pricing flowchart, updated rental flow state machine, sequence diagram with insurance decision)
12. docs/ONBOARDING.md: insurance module in key files/concepts + testing notes
Phase 5 — Verify & ship
13. npm run lint + npx tsc --noEmit + npm run build + final npm run test:coverage (proof captured)
14. Single commit, push to origin (Pablokill2004/RentMyGear-Fork-by_Pablo)
Ready to execute on your approval.

# Your current plan execution

Todo
[✓] Phase 0: Restore 6 lost bracket-path files (gear/[id] + category/[id])
[✓] Phase 0: Install @vitest/coverage-v8 + add testTimeout to vitest config
[✓] Phase 0: Fix 11 failing baseline tests (date-utils timezone, RentalFlow text, imageService timeout)
[✓] Phase 0: Verify all baseline tests pass + coverage runs
[✓] Phase 1: Write failing Smart Insurance test suite (RED)
[✓] Phase 2: Implement Smart Insurance (GREEN)
[•] Phase 3: Write tests for all remaining src files to reach 100% coverage
[ ] Phase 4: Update README.md, docs/DIAGRAMS.md, docs/ONBOARDING.md
[ ] Phase 5: Lint, build, final test:coverage, commit, push to origin

# The step where you left off
```bash
83% with clear gaps. The biggest remaining are HeroCarousel (50%), imageService (13%), and some ui components. Let me push these further.
✓General Task — Push coverage to 90%+
↳ 61 toolcalls · 17m 30s
ctrl+x down view subagents
```
## Subagents (general)
```bash
Coverage is now at 97.35% statements / 98.14% lines. Here's the summary:
Results
File	Before	After (Stmts)	After (Lines)
imageService.ts	13%	96.66%	98.24%
HeroCarousel.tsx	50%	96.66%	100%
carousel.tsx	73%	93.33%	97.61%
calendar.tsx	81%	covered dropdown branch	—
DateSelection.tsx	76%	90.47%	90.47%
card.tsx	85%	100%	100%
date-utils.ts	96%	96.55%	96.15%
Overall	83%	97.35%	98.14%
320 tests pass (32 new tests added, 0 failures).
Remaining Minor Gaps
- app/gear/[id]/page.tsx:36 and app/category/[id]/page.tsx:34 — notFound() calls (92-93%, accepted)
- DateSelection.tsx:49-50 — dead code behind disabled button attribute (can't trigger onClick)
- date-utils.ts:127 — defensive catch block in parseDateSafe (parseISO never throws)
- imageService.ts:178 — rate-limiting setTimeout in batch processing
- carousel.tsx:39 — useCarousel throw outside provider (requires non-mocked context test)
```

```bash
+ Thought: 1.1s
97.35% statements — excellent. Let me verify all tests pass and check the final coverage:
$ npm run test:run 2>&1 | Select-String -Pattern "Test Files|Tests |Duration" | Out-String
Test Files  35 passed (35)
      Tests  320 passed (320)
   Duration  13.50s (transform 6.61s, setup 8.39s, import 77.57s, tests 20.78s, environment 62.62s)
+ Thought: 314ms
> npm run test:coverage 2>&1 | Select-String -Pattern "\|.*\|.*\|.*\|.*\|" | Out-String
```