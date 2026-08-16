import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { PaginationParams } from "../../utils/pagination";
import { CreateTestCaseInput, UpdateTestCaseInput } from "./testCases.schema";

interface ListFilters {
  suiteId?: string;
  status?: string;
  priority?: string;
  requirementId?: string;
}

export async function listTestCases(pagination: PaginationParams, filters: ListFilters) {
  const where = {
    ...(filters.suiteId ? { suiteId: filters.suiteId } : {}),
    ...(filters.status ? { status: filters.status as any } : {}),
    ...(filters.priority ? { priority: filters.priority as any } : {}),
    ...(filters.requirementId ? { requirementId: filters.requirementId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.testCase.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { steps: true, executions: true } } },
    }),
    prisma.testCase.count({ where }),
  ]);
  return { data, total };
}

export async function createTestCase(userId: string, input: CreateTestCaseInput) {
  const testCase = await prisma.testCase.create({
    data: {
      suiteId: input.suiteId,
      requirementId: input.requirementId,
      title: input.title,
      description: input.description,
      preconditions: input.preconditions,
      priority: input.priority,
      type: input.type,
      createdById: userId,
      steps: { create: input.steps },
      history: {
        create: { changedById: userId, changeType: "CREATED", newValue: { title: input.title } },
      },
    },
    include: { steps: true },
  });
  return testCase;
}

export async function getTestCase(id: string) {
  const testCase = await prisma.testCase.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
      suite: { select: { id: true, name: true, projectId: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!testCase) throw ApiError.notFound("Test case not found");
  return testCase;
}

export async function updateTestCase(id: string, userId: string, input: UpdateTestCaseInput) {
  const existing = await getTestCase(id);

  const { steps, ...rest } = input;

  const testCase = await prisma.$transaction(async (tx) => {
    if (steps) {
      await tx.testStep.deleteMany({ where: { testCaseId: id } });
    }
    return tx.testCase.update({
      where: { id },
      data: {
        ...rest,
        updatedById: userId,
        ...(steps ? { steps: { create: steps } } : {}),
        history: {
          create: {
            changedById: userId,
            changeType: "UPDATED",
            previousValue: { title: existing.title },
            newValue: { title: rest.title ?? existing.title },
          },
        },
      },
      include: { steps: true },
    });
  });

  return testCase;
}

export async function updateStatus(id: string, userId: string, status: string) {
  const existing = await getTestCase(id);
  return prisma.testCase.update({
    where: { id },
    data: {
      status: status as any,
      updatedById: userId,
      history: {
        create: {
          changedById: userId,
          changeType: "STATUS_CHANGED",
          previousValue: { status: existing.status },
          newValue: { status },
        },
      },
    },
  });
}

export async function archiveTestCase(id: string, userId: string) {
  const existing = await getTestCase(id);
  return prisma.testCase.update({
    where: { id },
    data: {
      status: "DEPRECATED",
      updatedById: userId,
      history: {
        create: {
          changedById: userId,
          changeType: "ARCHIVED",
          previousValue: { status: existing.status },
          newValue: { status: "DEPRECATED" },
        },
      },
    },
  });
}

export async function getHistory(id: string) {
  await getTestCase(id);
  return prisma.testCaseHistory.findMany({
    where: { testCaseId: id },
    orderBy: { changedAt: "desc" },
    include: { changedBy: { select: { id: true, name: true } } },
  });
}
