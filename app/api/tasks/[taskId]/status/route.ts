import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedError, notFoundError } from "@/lib/api-response";
import { updateTaskStatusSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

/**
 * PATCH /api/tasks/[taskId]/status
 * Update task status
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorizedError();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const { taskId: taskIdStr } = await params;
    const taskId = Number(taskIdStr);
    if (isNaN(taskId)) {
      return errorResponse("Invalid task ID", 400);
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return notFoundError("Task");
    }

    const body = await request.json();

    // Validate input
    const validation = updateTaskStatusSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0].message,
        400,
        "VALIDATION_ERROR"
      );
    }

    const { status } = validation.data;
    const oldStatus = existingTask.status;

    // Update task status
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
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
      },
    });

    // Log activity
    await logActivity({
      userId: user.userId,
      action: "updated_task",
      entityType: "task",
      entityId: task.id,
      projectId: task.projectId,
      metadata: {
        taskTitle: task.title,
        field: "status",
        oldValue: oldStatus,
        newValue: status,
      },
    });

    // If task is completed, log that specifically
    if (status === "Completed" && oldStatus !== "Completed") {
      await logActivity({
        userId: user.userId,
        action: "completed_task",
        entityType: "task",
        entityId: task.id,
        projectId: task.projectId,
        metadata: { taskTitle: task.title },
      });
    }

    return successResponse(task);
  } catch (error) {
    console.error("Error updating task status:", error);
    return errorResponse("Failed to update task status");
  }
}
