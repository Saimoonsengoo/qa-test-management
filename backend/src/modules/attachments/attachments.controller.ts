import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";

// NOTE: this stores a reference (fileName/filePath/fileType) rather than
// handling multipart upload/storage itself — wire in S3/local disk storage
// and set filePath to the resulting URL before calling this in production.
export async function createHandler(req: Request, res: Response) {
  const { fileName, filePath, fileType, entityType, executionId, defectId } = req.body;
  if (!fileName || !filePath || !entityType) {
    throw ApiError.badRequest("fileName, filePath, and entityType are required");
  }
  if (entityType === "TEST_EXECUTION" && !executionId) {
    throw ApiError.badRequest("executionId is required when entityType is TEST_EXECUTION");
  }
  if (entityType === "DEFECT" && !defectId) {
    throw ApiError.badRequest("defectId is required when entityType is DEFECT");
  }

  const attachment = await prisma.attachment.create({
    data: { fileName, filePath, fileType, entityType, executionId, defectId, uploadedById: req.user!.id },
  });
  res.status(201).json({ success: true, data: attachment });
}

export async function listHandler(req: Request, res: Response) {
  const { entity_type, entity_id } = req.query as Record<string, string | undefined>;
  const attachments = await prisma.attachment.findMany({
    where: {
      ...(entity_type === "TEST_EXECUTION" && entity_id ? { executionId: entity_id } : {}),
      ...(entity_type === "DEFECT" && entity_id ? { defectId: entity_id } : {}),
    },
  });
  res.json({ success: true, data: attachments });
}

export async function deleteHandler(req: Request, res: Response) {
  await prisma.attachment.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: null });
}
