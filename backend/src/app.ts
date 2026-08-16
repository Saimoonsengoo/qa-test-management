import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { permissionsRouter, rolesRouter } from "./modules/roles/roles.routes";
import { projectsRouter } from "./modules/projects/projects.routes";
import { testSuitesRouter } from "./modules/testSuites/testSuites.routes";
import { testCasesRouter } from "./modules/testCases/testCases.routes";
import { testRunsRouter } from "./modules/testRuns/testRuns.routes";
import { testExecutionsRouter } from "./modules/testExecutions/testExecutions.routes";
import { defectsRouter } from "./modules/defects/defects.routes";
import { attachmentsRouter } from "./modules/attachments/attachments.routes";
import { notificationsRouter } from "./modules/notifications/notifications.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { reportsRouter } from "./modules/reports/reports.routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/test-suites", testSuitesRouter);
app.use("/api/test-cases", testCasesRouter);
app.use("/api/test-runs", testRunsRouter);
app.use("/api/test-executions", testExecutionsRouter);
app.use("/api/defects", defectsRouter);
app.use("/api/attachments", attachmentsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
