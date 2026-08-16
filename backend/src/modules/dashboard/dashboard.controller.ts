import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

// Powers Documents/TestHub/02 - Modules/Dashboard.md's "Main Information" and
// "Charts" sections.
export async function summaryHandler(req: Request, res: Response) {
  const projectId = req.query.project_id as string | undefined;
  const projectFilter = projectId ? { projectId } : {};

  const [
    totalProjects,
    activeProjects,
    totalTestCases,
    totalExecutions,
    executionsByStatus,
    defectsByStatus,
    openDefects,
    criticalDefects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.testCase.count(projectId ? { where: { suite: { projectId } } } : {}),
    prisma.testExecution.count(projectId ? { where: { testRun: { projectId } } } : {}),
    prisma.testExecution.groupBy({
      by: ["status"],
      _count: true,
      where: projectId ? { testRun: { projectId } } : {},
    }),
    prisma.defect.groupBy({ by: ["status"], _count: true, where: projectFilter }),
    prisma.defect.count({ where: { ...projectFilter, status: { notIn: ["CLOSED", "REJECTED"] } } }),
    prisma.defect.count({ where: { ...projectFilter, severity: "CRITICAL" } }),
  ]);

  res.json({
    success: true,
    data: {
      totalProjects,
      activeProjects,
      totalTestCases,
      totalExecutions,
      openDefects,
      criticalDefects,
      executionSummary: executionsByStatus.map((e) => ({ status: e.status, count: e._count })),
      defectSummary: defectsByStatus.map((d) => ({ status: d.status, count: d._count })),
    },
  });
}
