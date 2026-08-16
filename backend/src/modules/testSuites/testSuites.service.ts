import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { CreateSuiteInput, UpdateSuiteInput } from "./testSuites.schema";

export async function listSuites(projectId: string) {
  return prisma.testSuite.findMany({
    where: { projectId },
    include: { _count: { select: { testCases: true, children: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createSuite(input: CreateSuiteInput) {
  return prisma.testSuite.create({ data: input });
}

export async function getSuite(id: string) {
  const suite = await prisma.testSuite.findUnique({
    where: { id },
    include: { children: true, testCases: { select: { id: true, title: true, status: true, priority: true } } },
  });
  if (!suite) throw ApiError.notFound("Test suite not found");
  return suite;
}

export async function updateSuite(id: string, input: UpdateSuiteInput) {
  await getSuite(id);
  return prisma.testSuite.update({ where: { id }, data: input });
}

export async function archiveSuite(id: string) {
  await getSuite(id);
  return prisma.testSuite.update({ where: { id }, data: { status: "ARCHIVED" } });
}
