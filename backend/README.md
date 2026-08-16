# TestHub — Backend

Express + TypeScript + Prisma API for the QA Test Management System spec'd out
in `Documents/TestHub/` in the Obsidian vault. Directly implements the modules,
database design, and API routes documented there — see the code comments for
pointers back to specific vault docs (workflow rules, coverage definitions, etc).

## Setup

```bash
npm install
cp .env.example .env          # then edit DATABASE_URL / JWT_SECRET if needed

# From the repo root: start Postgres + Adminer (localhost:8080 for a DB UI)
docker-compose up -d

npx prisma migrate dev --name init   # creates tables from prisma/schema.prisma
npx prisma db seed                   # roles, permissions, demo admin + project

npm run dev                          # http://localhost:4000
```

Demo login (created by the seed script): `admin@testhub.dev` / `Admin@12345`

## Project layout

```
src/
  config/       env + Prisma client singleton
  middleware/   auth (JWT), error handling, zod validation
  modules/      one folder per domain: auth, users, roles, projects,
                testSuites, testCases, testRuns, testExecutions, defects,
                attachments, notifications, dashboard, reports
  app.ts        Express app + route mounting
  server.ts     entrypoint
prisma/
  schema.prisma mirrors Database Design.md / Entity Relationship.md
  seed.ts       roles, permissions, demo admin user + sample project
```

## Notable design decisions (see vault docs for full rationale)

- **Test case status**: `DRAFT → REVIEW → READY → DEPRECATED`. Execution
  results live on `TestExecution`, not on the test case — a Ready case can be
  executed many times without changing its own status.
- **Defect workflow**: transitions are enforced server-side in
  `modules/defects/defects.service.ts` (`ALLOWED_TRANSITIONS`), matching
  `Defect Workflow.md` exactly, including the `Rejected` branch.
- **Test coverage** (`GET /api/reports/coverage`): % of `Ready` test cases
  with at least one non-`NOT_RUN` execution in scope.
- **Automation ingestion**: `POST /api/test-executions/import` accepts an
  array of `{ testCaseId, status, actualResult, comment }` — built as the
  hook for piping real Playwright JSON-reporter output into a run.
- **Attachments** use a polymorphic `entityType` + `executionId`/`defectId`
  pair rather than a generic `entityId`, trading a little denormalization for
  real foreign-key integrity in Postgres.

## Known gap

`attachments.filePath` is stored as-is — this API does not itself handle
multipart upload or file storage. Wire in S3 (or local disk + a static route)
in front of `POST /api/attachments` before using this for real files.
