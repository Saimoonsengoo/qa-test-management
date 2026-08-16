import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { PaginationParams } from "../../utils/pagination";
import { AddMemberInput, CreateProjectInput, UpdateProjectInput } from "./projects.schema";

export async function listProjects(pagination: PaginationParams, status?: string) {
  const where = status ? { status: status as any } : {};
  const [data, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { members: true, suites: true } } },
    }),
    prisma.project.count({ where }),
  ]);
  return { data, total };
}

export async function createProject(ownerId: string, input: CreateProjectInput) {
  const existingKey = await prisma.project.findUnique({ where: { key: input.key } });
  if (existingKey) throw ApiError.conflict(`Project key "${input.key}" is already in use`);

  return prisma.project.create({
    data: { ...input, ownerId, members: { create: { userId: ownerId, projectRole: "QA Lead" } } },
    include: { owner: true, members: true },
  });
}

export async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { suites: true, runs: true, defects: true } },
    },
  });
  if (!project) throw ApiError.notFound("Project not found");
  return project;
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  await getProject(id);
  return prisma.project.update({ where: { id }, data: input });
}

export async function archiveProject(id: string) {
  await getProject(id);
  return prisma.project.update({ where: { id }, data: { status: "ARCHIVED" } });
}

export async function addMember(projectId: string, input: AddMemberInput) {
  await getProject(projectId);
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: input.userId } },
  });
  if (existing) throw ApiError.conflict("User is already a member of this project");

  return prisma.projectMember.create({
    data: { projectId, userId: input.userId, projectRole: input.projectRole },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function removeMember(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership) throw ApiError.notFound("Membership not found");
  await prisma.projectMember.delete({ where: { id: membership.id } });
}
