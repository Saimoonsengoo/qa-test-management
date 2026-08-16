import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { PaginationParams } from "../../utils/pagination";
import { CreateDefectInput, UpdateDefectInput } from "./defects.schema";

// Enforces the transitions in Documents/TestHub/03 - Workflow/Defect Workflow.md.
// Keep this table in sync if the workflow doc changes.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["RETEST"],
  RETEST: ["CLOSED", "REOPENED"],
  REOPENED: ["IN_PROGRESS"],
  CLOSED: [],
  REJECTED: [],
};

interface ListFilters {
  projectId?: string;
  status?: string;
  severity?: string;
  priority?: string;
  assigneeId?: string;
}

export async function listDefects(pagination: PaginationParams, filters: ListFilters) {
  const where = {
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.status ? { status: filters.status as any } : {}),
    ...(filters.severity ? { severity: filters.severity as any } : {}),
    ...(filters.priority ? { priority: filters.priority as any } : {}),
    ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.defect.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
      include: {
        assignee: { select: { id: true, name: true } },
        testCase: { select: { id: true, title: true } },
      },
    }),
    prisma.defect.count({ where }),
  ]);
  return { data, total };
}

export async function createDefect(userId: string, input: CreateDefectInput) {
  return prisma.defect.create({
    data: {
      ...input,
      createdById: userId,
      status: "NEW",
      history: { create: { toStatus: "NEW", changedById: userId } },
    },
  });
}

export async function getDefect(id: string) {
  const defect = await prisma.defect.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      testCase: { select: { id: true, title: true } },
      history: { orderBy: { changedAt: "desc" }, include: { changedBy: { select: { id: true, name: true } } } },
      attachments: true,
    },
  });
  if (!defect) throw ApiError.notFound("Defect not found");
  return defect;
}

export async function updateDefect(id: string, input: UpdateDefectInput) {
  await getDefect(id);
  return prisma.defect.update({ where: { id }, data: input });
}

export async function updateDefectStatus(id: string, userId: string, nextStatus: string) {
  const defect = await getDefect(id);

  const allowed = ALLOWED_TRANSITIONS[defect.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw ApiError.badRequest(
      `Cannot move a defect from ${defect.status} to ${nextStatus}. Allowed next states: ${
        allowed.length ? allowed.join(", ") : "none — this is a terminal state"
      }.`
    );
  }

  return prisma.defect.update({
    where: { id },
    data: {
      status: nextStatus as any,
      history: { create: { fromStatus: defect.status, toStatus: nextStatus as any, changedById: userId } },
    },
  });
}
