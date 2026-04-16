# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## SchoolSafe BD (artifacts/schoolsafe-bd)

Bilingual (English/Bangla) environmental school safety dashboard for Bangladesh.
React + Vite, using Open-Meteo free APIs for live weather and air quality data.

### Risk Engine Architecture

- **4-level risk scale**: None / Low / Moderate / High (types/index.ts)
- **7 risk types**: Heat, Rain, Air Quality, Cold, Heavy Rain, Flood, Storm/Cyclone
- **Thresholds**: All numeric constants in `logic/thresholds.ts` — Bangladesh-calibrated
- **Evaluators**: 7 pure functions in `logic/riskEngine.ts`, each returns {level, rules}
- **Overall aggregation**: Weighted scoring model (not worst-case):
  - Formula: overallScore = Σ(riskLevel × weight)
  - Weights: AQ=0.75, Rain=0.75, Heat=1.0, Cold=1.0, HeavyRain=1.25, Flood=1.5, Storm=1.5
  - Bands: 0=None, 0.75–1.99=Low, 2.0–4.24=Moderate, 4.25+=High
  - Override rules: Flood/Storm High→High, 2+ High→High, 1 High+1 Moderate→High
  - Downgrade rules: AQ-only Moderate→Low, Rain-only Moderate→Low
- **Weather data fields**: rain (hourly), rain3h, rain6h, rain24h (24-hour rolling sum)
- **GitHub repo**: iqbalhimel003/schoolsafe-bd (SSH deploy key required for push)
