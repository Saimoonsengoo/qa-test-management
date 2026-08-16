# TestHub — Frontend

React + TypeScript + Vite client for the TestHub QA Test Management System.

## Setup

```bash
npm install
npm run dev     # http://localhost:5173, proxies /api to http://localhost:4000
```

Make sure the backend is running first (see `../backend/README.md`).

## Design system

"Lab clipboard" aesthetic — see `src/styles/index.css` for the full token set.
Cool paper background, deep slate ink, a steady verification-blue accent, and
a functional signal palette (pass/fail/blocked/neutral) used as a colored
left-rail on cards and table rows (`.rail-pass`, `.rail-fail`,
`.rail-blocked`) — the point is a list of test runs or defects should read
like a signal panel at a glance, not just have colored badges.

`StatusBadge` (`src/components/StatusBadge.tsx`) is the single source of
truth mapping every status enum in the system to a badge color — update it
there if a new status is added, rather than styling badges inline elsewhere.

## Pages

| Route | Page |
|---|---|
| `/login` | Sign in |
| `/` | Dashboard — cross-project stats |
| `/projects` | Project list + create |
| `/projects/:id` | Project overview + members |
| `/projects/:id/suites` → `/suites/:suiteId` | Test suites → test cases (with steps) |
| `/projects/:id/runs` → `/runs/:runId` | Test runs → record Pass/Fail/Blocked/Skipped |
| `/projects/:id/defects` → `/defects/:defectId` | Defects list + detail with workflow transitions |
| `/projects/:id/reports` | Coverage % + defect breakdowns |
| `/defects` | Open defects across all projects |
