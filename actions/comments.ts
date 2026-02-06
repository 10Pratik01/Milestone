"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTaskComments(taskId: number) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      user: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return comments;
}

export async function createTaskComment(taskId: number, text: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const comment = await prisma.comment.create({
    data: {
      text,
      taskId,
      userId: user.userId,
    },
    include: {
        user: true
    }
  });
  
  // Log activity
  await prisma.activity.create({
      data: {
          userId: user.userId,
          action: "commented",
          entityType: "task",
          entityId: taskId,
          taskId: taskId,
          // We could lookup projectId from task if needed, simpler to skip or fetch task first
      }
  })

  // Revalidate might be needed if displayed lists show comment counts
  revalidatePath("/projects"); 

  return comment;
}
