import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { ImportResultsInput, RecordResultInput } from "./testExecutions.schema";

export async function listExecutions(testRunId: string) {
  return prisma.testExecution.findMany({
    where: { testRunId },
    include: {
      testCase: { select: { id: true, title: true, priority: true } },
      tester: { select: { id: true, name: true } },
    },
  });
}

export async function getExecution(id: string) {
  const execution = await prisma.testExecution.findUnique({
    where: { id },
    include: { testCase: true, tester: { select: { id: true, name: true } }, attachments: true },
  });
  if (!execution) throw ApiError.notFound("Test execution not found");
  return execution;
}

// Recording a result is the moment a Ready test case actually "counts" toward
// coverage — see the Test Coverage definition in Test Report.md.
export async function recordResult(id: string, testerId: string, input: RecordResultInput) {
  await getExecution(id);
  return prisma.testExecution.update({
    where: { id },
    data: { ...input, testerId, executedAt: new Date() },
  });
}

// Bulk-ingest automation results (e.g. Playwright) into an existing run.
// Any testCaseId not yet part of the run gets a TestRunCase link + execution
// created on the fly, so import-only runs (no manual assignment step) work too.
export async function importResults(userId: string, input: ImportResultsInput) {
  const run = await prisma.testRun.findUnique({ where: { id: input.testRunId } });
  if (!run) throw ApiError.notFound("Test run not found");

  const results = [];
  for (const row of input.results) {
    await prisma.testRunCase.upsert({
      where: { testRunId_testCaseId: { testRunId: input.testRunId, testCaseId: row.testCaseId } },
      create: { testRunId: input.testRunId, testCaseId: row.testCaseId },
      update: {},
    });

    const existing = await prisma.testExecution.findFirst({
      where: { testRunId: input.testRunId, testCaseId: row.testCaseId },
    });

    const data = {
      status: row.status,
      actualResult: row.actualResult,
      comment: row.comment ?? "Imported from automation",
      testerId: userId,
      executedAt: new Date(),
    };

    const execution = existing
      ? await prisma.testExecution.update({ where: { id: existing.id }, data })
      : await prisma.testExecution.create({
          data: { testRunId: input.testRunId, testCaseId: row.testCaseId, ...data },
        });

    results.push(execution);
  }

  return results;
}
