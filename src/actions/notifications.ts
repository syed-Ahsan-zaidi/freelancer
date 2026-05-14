"use server";

import { prisma } from "./prisma.config";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { success: true, notifications };
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return { success: false, notifications: [] };
  }
}

export async function markAllRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false };
  }
}

export async function createNotification(message: string, type: string, userId: string) {
  try {
    await prisma.notification.create({
      data: { message, type, userId, isRead: false },
    });
  } catch (error: any) {
    console.error("Notification create error:", error);
  }
}
