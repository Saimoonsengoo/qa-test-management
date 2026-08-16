import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";

export async function executionSummaryHandler(req: Request, res: Response) {
  const { project_id, test_run_id } = req.query as Record<string, string | undefined>;

  const where = {
    ...(test_run_id ? { id: test_run_id } : {}),
    ...(project_id ? { projectId: project_id } : {}),
  };

  const executions = await prisma.testExecution.findMany({
    where: { testRun: where },
  });

  const total = executions.length;
  const counts = executions.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      total,
      counts,
      percentages: Object.fromEntries(
        Object.entries(counts).map(([status, count]) => [status, total ? Math.round((count / total) * 1000) / 10 : 0])
      ),
    },
  });
}

// Test Coverage = (Ready test cases with >=1 execution in scope) / (Total Ready
// test cases in scope) x 100 — definition lives in Test Report.md, keep in sync.
export async function coverageHandler(req: Request, res: Response) {
  const { project_id, test_run_id } = req.query as Record<string, string | undefined>;
  if (!project_id) throw ApiError.badRequest("project_id query param is required");

  const readyCases = await prisma.testCase.findMany({
    where: { status: "READY", suite: { projectId: project_id } },
    select: { id: true },
  });
  const readyIds = readyCases.map((c) => c.id);

  const executedCaseIds = await prisma.testExecution.findMany({
    where: {
      testCaseId: { in: readyIds },
      status: { not: "NOT_RUN" },
      ...(test_run_id ? { testRunId: test_run_id } : {}),
    },
    select: { testCaseId: true },
    distinct: ["testCaseId"],
  });

  const totalReady = readyIds.length;
  const executedCount = executedCaseIds.length;
  const coveragePercent = totalReady ? Math.round((executedCount / totalReady) * 1000) / 10 : 0;

  res.json({
    success: true,
    data: { totalReadyTestCases: totalReady, executedTestCases: executedCount, coveragePercent },
  });
}

export async function defectSummaryHandler(req: Request, res: Response) {
  const { project_id, date_from, date_to } = req.query as Record<string, string | undefined>;

  const where = {
    ...(project_id ? { projectId: project_id } : {}),
    ...(date_from || date_to
      ? {
          createdAt: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {}),
          },
        }
      : {}),
  };

  const [byStatus, bySeverity, byPriority] = await Promise.all([
    prisma.defect.groupBy({ by: ["status"], _count: true, where }),
    prisma.defect.groupBy({ by: ["severity"], _count: true, where }),
    prisma.defect.groupBy({ by: ["priority"], _count: true, where }),
  ]);

  res.json({
    success: true,
    data: {
      byStatus: byStatus.map((r) => ({ status: r.status, count: r._count })),
      bySeverity: bySeverity.map((r) => ({ severity: r.severity, count: r._count })),
      byPriority: byPriority.map((r) => ({ priority: r.priority, count: r._count })),
    },
  });
}
