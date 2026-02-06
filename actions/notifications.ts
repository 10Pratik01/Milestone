"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get all notifications for the current user
 */
export async function getNotifications() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limit to 50 most recent
  });

  return notifications;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true },
  });

  if (!user) {
    return 0; // Handle gracefully if user is not yet synced
  }

  const count = await prisma.notification.count({
    where: {
      userId: user.userId,
      isRead: false,
    },
  });

  return count;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: user.userId, // Ensure user owns this notification
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/notifications");
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.notification.updateMany({
    where: {
      userId: user.userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/notifications");
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId: user.userId, // Ensure user owns this notification
    },
  });

  revalidatePath("/notifications");
}
