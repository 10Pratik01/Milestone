import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedError } from "@/lib/api-response";

/**
 * GET /api/tasks/user/[userId]
 * Get all tasks for a specific user (as author or assignee)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorizedError();

    const { userId: userIdStr } = await params;
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      return errorResponse("Invalid user ID", 400);
    }

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: userId },
          { assignedUserId: userId },
        ],
      },
      include: {
        author: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        assignee: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(tasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return errorResponse("Failed to fetch user tasks");
  }
}
