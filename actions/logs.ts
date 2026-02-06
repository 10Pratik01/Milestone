"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";

/**
 * Get project logs (activity feed) for a specific project
 */
export async function getProjectLogs(projectId: number) {
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

  const logs = await prisma.projectLog.findMany({
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
      createdAt: "desc",
    },
    take: 100, // Limit to 100 most recent logs
  });

  return logs;
}
