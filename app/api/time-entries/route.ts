import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedError } from "@/lib/api-response";
import { createTimeEntrySchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

/**
 * GET /api/time-entries?taskId=123
 * Get time entries for a task
 */
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const userId = searchParams.get("userId");

    const where: any = {};
    if (taskId) where.taskId = Number(taskId);
    if (userId) where.userId = Number(userId);

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate total hours
    const totalHours = timeEntries.reduce((sum: number, entry: any) => sum + entry.hours, 0);

    return successResponse({
      timeEntries,
      totalHours,
    });
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return errorResponse("Failed to fetch time entries");
  }
}

/**
 * POST /api/time-entries
 * Log time for a task
 */
export async function POST(request: Request) {
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

    const body = await request.json();

    // Validate input
    const validation = createTimeEntrySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0].message,
        400,
        "VALIDATION_ERROR"
      );
    }

    const { taskId, hours, description, date } = validation.data;

    // Get task info
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, projectId: true },
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    // Create time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId: user.userId,
        hours,
        description,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      userId: user.userId,
      action: "logged_time",
      entityType: "timeEntry",
      entityId: timeEntry.id,
      projectId: task.projectId,
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        hours,
      },
    });

    return successResponse(timeEntry, 201);
  } catch (error) {
    console.error("Error creating time entry:", error);
    return errorResponse("Failed to log time");
  }
}
