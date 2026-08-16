import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export async function listHandler(req: Request, res: Response) {
  const isRead = req.query.is_read as string | undefined;
  const notifications = await prisma.notification.findMany({
    where: {
      recipientId: req.user!.id,
      ...(isRead !== undefined ? { isRead: isRead === "true" } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: notifications });
}

export async function markReadHandler(req: Request, res: Response) {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.json({ success: true, data: notification });
}

export async function markAllReadHandler(req: Request, res: Response) {
  await prisma.notification.updateMany({
    where: { recipientId: req.user!.id, isRead: false },
    data: { isRead: true },
  });
  res.json({ success: true, data: null });
}
