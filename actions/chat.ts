"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get chat messages for a specific project
 */
export async function getProjectChat(projectId: number) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true, teamId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify user has access to this project
  const hasAccess = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        {
          projectTeams: {
            some: {
              teamId: user.teamId ?? undefined,
            },
          },
        },
        {
          tasks: {
            some: {
              OR: [
                { authorUserId: user.userId },
                { assignedUserId: user.userId },
              ],
            },
          },
        },
      ],
    },
  });

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  const messages = await prisma.projectChat.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
}

/**
 * Send a chat message to a project
 */
export async function sendProjectMessage(projectId: number, message: string) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true, teamId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify user has access to this project
  const hasAccess = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        {
          projectTeams: {
            some: {
              teamId: user.teamId ?? undefined,
            },
          },
        },
        {
          tasks: {
            some: {
              OR: [
                { authorUserId: user.userId },
                { assignedUserId: user.userId },
              ],
            },
          },
        },
      ],
    },
  });

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  const chatMessage = await prisma.projectChat.create({
    data: {
      projectId,
      userId: user.userId,
      message,
    },
    include: {
      user: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  // Create a log entry
  await prisma.projectLog.create({
    data: {
      projectId,
      userId: user.userId,
      action: "SENT_MESSAGE",
      entityType: "chat",
      entityId: chatMessage.id,
      description: `Sent a message in project chat`,
    },
  });

  revalidatePath(`/projects/${projectId}/chat`);
  return chatMessage;
}

/**
 * Delete a chat message (only if user is the author)
 */
export async function deleteProjectMessage(messageId: number) {
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

  // Get the message to verify ownership
  const message = await prisma.projectChat.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.userId !== user.userId) {
    throw new Error("You can only delete your own messages");
  }

  await prisma.projectChat.delete({
    where: { id: messageId },
  });

  revalidatePath(`/projects/${message.projectId}/chat`);
}
