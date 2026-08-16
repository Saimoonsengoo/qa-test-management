import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { CreateTestRunInput, UpdateTestRunInput } from "./testRuns.schema";

export async function listTestRuns(projectId: string) {
  return prisma.testRun.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { runCases: true, executions: true } } },
  });
}

export async function createTestRun(userId: string, input: CreateTestRunInput) {
  return prisma.testRun.create({ data: { ...input, createdById: userId } });
}

export async function getTestRun(id: string) {
  const run = await prisma.testRun.findUnique({
    where: { id },
    include: {
      runCases: { include: { testCase: { select: { id: true, title: true, priority: true } } } },
      executions: {
        include: { testCase: { select: { id: true, title: true } }, tester: { select: { id: true, name: true } } },
      },
    },
  });
  if (!run) throw ApiError.notFound("Test run not found");
  return run;
}

export async function updateTestRun(id: string, input: UpdateTestRunInput) {
  await getTestRun(id);
  return prisma.testRun.update({ where: { id }, data: input });
}

// Assigning a case to a run also creates a NOT_RUN execution placeholder so
// the run's progress (pass/fail/blocked/not-run) is always fully accounted for.
export async function assignTestCases(runId: string, testerId: string, testCaseIds: string[]) {
  const run = await getTestRun(runId);

  await prisma.$transaction(async (tx) => {
    for (const testCaseId of testCaseIds) {
      await tx.testRunCase.upsert({
        where: { testRunId_testCaseId: { testRunId: runId, testCaseId } },
        create: { testRunId: runId, testCaseId },
        update: {},
      });
      const existingExecution = await tx.testExecution.findFirst({
        where: { testRunId: runId, testCaseId },
      });
      if (!existingExecution) {
        await tx.testExecution.create({
          data: { testRunId: runId, testCaseId, testerId, status: "NOT_RUN" },
        });
      }
    }
    if (run.status === "NOT_STARTED") {
      await tx.testRun.update({ where: { id: runId }, data: { status: "IN_PROGRESS" } });
    }
  });

  return getTestRun(runId);
}
