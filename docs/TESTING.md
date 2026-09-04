# Testing Suite Documentation

## Overview

This document summarizes the testing suite for the Rent my Gear rental module, implemented using **Vitest**, **React Testing Library**, and **@vitest/coverage-v8**.

The project enforces **100% coverage** (statements, branches, functions, lines) via `npm run test:coverage`.

## Test Results Summary

```bash
npm run test:coverage
```

```
=============================== Coverage summary ===============================
Statements   : 100% ( 563/563 )
Branches     : 100% ( 251/251 )
Functions    : 100% ( 164/164 )
Lines        : 100% ( 538/538 )
================================================================================
```

| Metric | Result |
|--------|--------|
| Test files | 36 |
| Tests | 340 passed / 0 failed |
| Coverage | 100% on all metrics |

## Test Categories

### 1. Smart Insurance (TDD feature suite) — `src/lib/insurance.test.ts`

Built test-first (RED → GREEN). The suite was written and confirmed failing before `insurance.ts` existed.

| Rule | Test | Status |
|------|------|--------|
| Photography/Video = high risk | `getInsuranceRate("fotografia-video")` → 0.20 | ✅ |
| Mountain & Camping = standard | `getInsuranceRate("montana-camping")` → 0.10 | ✅ |
| Water Sports = standard | `getInsuranceRate("deportes-acuaticos")` → 0.10 | ✅ |
| Fee formula | `dailyRate × days × rate` | ✅ |
| Opt-out | `insuranceSelected: false` → fee 0, total = subtotal | ✅ |
| Full breakdown | `calculatePriceWithInsurance` returns `{days, dailyRate, subtotal, insuranceRate, insuranceFee, total}` | ✅ |

UI integration (also TDD): `PriceSummary.test.tsx` covers the toggle, the "Protección de Daños (20%)" line, and total recalculation; `RentalFlow.test.tsx` covers `insuranceSelected` in the POST body and state reset; `Confirmation.test.tsx` covers the protection badge.

### 2. Unit Tests — `src/lib/`

- **`date-utils.test.ts`** — days calculation (inclusive, leap year, cross-month/year), pricing, MXN formatting, Spanish date formatting, range validation, safe parsing. Tests use local-time `Date` constructors to be timezone-independent.
- **`validation.test.ts`** — all Zod schemas (gear item, rental dates, rental request/confirmation) plus `validateGearItem`, `validateRentalDates`, `isValidCategory`.
- **`insurance.test.ts`** — see section 1.
- **`utils.test.ts`** — `cn()` class merging.

### 3. Service Tests — `src/services/`

- **`inventoryService.test.ts`** — `fs.promises` mocked; covers caching, load/save error paths, category filtering, search, random selection, image updates, and stats.
- **`storageService.test.ts`** — `@google-cloud/storage` and env mocked; covers uploads (incl. content-type extension fallback), deletion, existence checks, listing, URL extraction, and error wrapping.
- **`imageService.test.ts`** — `@google/generative-ai`, storage, and inventory mocked; covers `resolveImageUrl`, `isImageUrlValid`, the full generate→upload→persist path, failure branches of AI responses (no parts / no inlineData), batch processing incl. rate-limiting between items, and Gemini client singleton reuse.

### 4. Config Tests — `src/config/env.test.ts`

Zod validation of environment variables, lazy caching, and `isEnvConfigured()` true/false paths (uses `vi.resetModules()` + dynamic imports to reset the module-level cache).

### 5. API Route Tests — `src/app/api/`

- **`rental/route.test.ts`** — 201 confirmation (incl. `subtotal`, `insuranceFee`, `totalPrice`), insurance on/off, 400 invalid body, 404 unknown gear, 500 internal error, 405 GET.
- **`generate-image/route.test.ts`** — GET redirect for existing images, on-demand generation, missing/invalid params, POST variants, and error branches.

### 6. Component Tests — `src/components/`

- **RentalFlow** (`index`, `DateSelection`, `PriceSummary`, `Confirmation`) — full wizard navigation, insurance toggle, POST payload, back navigation from every step, error states, disabled-guard branches.
- **Feature components** — `CategoryButtons`, `GearGrid` (search filtering, image load/error/fallback, skeleton), `GearImage` (on-demand generation flow incl. non-Error throws), `HeroCarousel` (api registration/re-registration, autoplay interval, dots).
- **UI primitives** — `button`, `badge`, `card`, `input`, `skeleton`, `sonner`, `calendar` (react-day-picker roles), `carousel` (embla mocked; provider guard, keyboard handler, orientation variants).

### 7. Route/Page Tests — `src/app/`

- `page.test.tsx`, `layout.test.tsx`, `error.test.tsx` (root, `gear/[id]`, `category/[id]`), `loading.tsx` pages, and the async server components `gear/[id]/page.tsx` / `category/[id]/page.tsx` (invoked via `await Component({params})` then rendered; `notFound()` covered by direct call with a mocked item).

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with coverage (must stay at 100%)
npm run test:coverage

# Run a single file
npx vitest run src/lib/insurance.test.ts
```

## Test Architecture

```
src/
├── app/
│   ├── api/rental/route.test.ts
│   ├── api/generate-image/route.test.ts
│   ├── error.test.tsx, layout.test.tsx, page.test.tsx
│   ├── gear/[id]/{page,error,loading}.test.tsx
│   └── category/[id]/{page,error,loading}.test.tsx
├── components/
│   ├── features/*.test.tsx
│   ├── features/RentalFlow/{RentalFlow,DateSelection,DateSelection.guards,PriceSummary,Confirmation}.test.tsx
│   └── ui/{button,badge,card,input,skeleton,sonner,calendar,carousel}.test.tsx
├── config/env.test.ts
├── lib/{date-utils,validation,insurance,utils}.test.ts
├── services/{inventoryService,storageService,imageService}.test.ts
└── test/setup.tsx
```

## Mocking Strategy

### Next.js Mocks (global, in `src/test/setup.tsx`)
- `next/navigation`: Router, pathname, searchParams (route tests override with a throwing `notFound`)
- `next/image`: renders a plain `<img>` forwarding props (so `onLoad`/`onError` are testable)
- `global.fetch`: reset between tests

### Local Mocks
- `next/font/google` and `next-themes` + `sonner` (layout test)
- `fs.promises` (inventoryService)
- `@google-cloud/storage` + `@/config/env` (storageService)
- `@google/generative-ai` + sibling services (imageService)
- `embla-carousel-react` with a controllable api (carousel, HeroCarousel)
- `@/components/ui/calendar` with scriptable buttons (RentalFlow integration)

### Conventions
- Timezone-dependent assertions use local-time constructors (`new Date(2024, 0, 15)`), never ISO strings parsed as UTC.
- Modules with lazy singletons (`env.ts`, `imageService.ts`) are re-imported via `vi.resetModules()` + dynamic `import()` per test.
- `testTimeout: 30000` accommodates slow first-time imports of the Google SDKs.

## Coverage Policy

1. Every file under `src/` (excluding `src/test/`) must remain at 100% for all four metrics.
2. New features must follow TDD: failing tests first, implementation second.
3. If a defensive branch is genuinely unreachable, prefer simplifying the source over `v8 ignore` comments — the current codebase needs none.
