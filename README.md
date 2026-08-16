# TestHub — QA Test Management System

A full-stack test management tool (think a lightweight TestRail), built
directly from the spec in this vault's `Documents/TestHub/` folder:
`00 - Overview` → `08 - Development`, cross-linked in `Connection/Connection.md`.

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT auth
- **Frontend**: React, TypeScript, Vite, react-router

## Quick start

```bash
docker-compose up -d              # Postgres on :5432, Adminer UI on :8080

cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev                       # API on :4000

# in a second terminal
cd frontend
npm install
npm run dev                       # app on :5173
```

Log in with the seeded demo account: `admin@testhub.dev` / `Admin@12345`

## What's implemented

- Auth (register/login/JWT), role-based route gating (Admin/QA Lead/QA
  Engineer/Developer/Viewer), roles & permissions CRUD
- Projects with members (`project_members`, per-project role)
- Test Suites (nested) → Test Cases (with steps + full audit history)
- Test Runs → assign Ready test cases → record Pass/Fail/Blocked/Skipped
- Defects with **server-enforced** workflow transitions (matches
  `Defect Workflow.md` exactly, including the `Rejected` branch)
- Reports: execution summary, **test coverage** (defined precisely in
  `Test Report.md`), defect summary by status/severity/priority
- `POST /api/test-executions/import` — bulk-ingest automation results (built
  with Steve's real Playwright OAxis 365+ suite in mind)
- Dashboard with cross-project stats

## What's stubbed / next

- **Attachments**: DB model + API exist; no file upload/storage wired in yet
  (S3 or local disk needs to be added in front of `POST /api/attachments`)
- **Notifications**: DB model + API exist; nothing triggers them yet (no event
  hooks on defect assignment, run completion, etc.) — this was flagged as a
  stretch item in `Notification.md`, not core MVP
- **CSV/Excel import-export** for test cases: routes are documented in
  `API Overview.md` (`/api/test-cases/import`, `/export`) but not yet
  implemented in `testCases.service.ts`
- **Requirement coverage** (secondary metric in `Test Report.md`): only test
  case coverage is implemented in `/api/reports/coverage` so far

See `backend/README.md` and `frontend/README.md` for more detail on each side.
