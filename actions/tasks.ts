"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get tasks for a specific project
 */
export async function getTasks(projectId: number) {
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
        { ownerUserId: user.userId }, // Allow if user is owner
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

  const tasks = await prisma.task.findMany({
    where: { projectId },
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
      attachments: true,
      comments: {
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profilePictureUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
}

/**
 * Get tasks assigned to the current user
 */
export async function getMyTasks() {
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

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { authorUserId: user.userId },
        { assignedUserId: user.userId },
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
      dueDate: "asc",
    },
  });

  return tasks;
}

/**
 * Create a new task
 */
export async function createTask(data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  assignedUserId?: number;
}) {
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

  // Verify user has access to this project (Owner or Team Member)
  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    include: {
        projectTeams: true
    }
  });

  if (!project) {
      throw new Error("Project not found");
  }

  const isOwner = project.ownerUserId === user.userId;
  const isTeamMember = project.projectTeams.some(pt => pt.teamId === user.teamId);

  if (!isOwner && !isTeamMember) {
      throw new Error("Access denied: You must be a project member or owner to create tasks.");
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "To Do",
      priority: data.priority || "Medium",
      tags: data.tags,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      points: data.points,
      projectId: data.projectId,
      authorUserId: user.userId,
      assignedUserId: data.assignedUserId,
    },
    include: {
      author: true,
      assignee: true,
    },
  });

  // Create activity log
  await prisma.activity.create({
    data: {
      userId: user.userId,
      action: "created_task",
      entityType: "task",
      entityId: task.id,
      projectId: data.projectId,
      metadata: {
        taskTitle: task.title,
      },
    },
  });

  // Create project log
  await prisma.projectLog.create({
    data: {
      projectId: data.projectId,
      userId: user.userId,
      action: "CREATED_TASK",
      entityType: "task",
      entityId: task.id,
      description: `Created task "${task.title}"`,
    },
  });

  // If assigned to someone, create notification
  if (data.assignedUserId && data.assignedUserId !== user.userId) {
    await prisma.notification.create({
      data: {
        userId: data.assignedUserId,
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        message: `You have been assigned to task: ${task.title}`,
        taskId: task.id,
        projectId: data.projectId,
      },
    });
  }

  revalidatePath(`/projects/${data.projectId}`);
  return task;
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: number, status: string) {
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

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: {
      author: true,
      assignee: true,
    },
  });

  // Create activity log
  await prisma.activity.create({
    data: {
      userId: user.userId,
      action: "updated_status",
      entityType: "task",
      entityId: task.id,
      projectId: task.projectId,
      metadata: {
        oldStatus: task.status,
        newStatus: status,
      },
    },
  });

  // Create project log
  await prisma.projectLog.create({
    data: {
      projectId: task.projectId,
      userId: user.userId,
      action: "UPDATED_STATUS",
      entityType: "task",
      entityId: task.id,
      description: `Updated task "${task.title}" status to ${status}`,
    },
  });

  revalidatePath(`/projects/${task.projectId}`);
  return task;
}

/**
 * Update task priority
 */
export async function updateTaskPriority(taskId: number, priority: string) {
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

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { priority },
    include: {
      author: true,
      assignee: true,
    },
  });

  // Create project log
  await prisma.projectLog.create({
    data: {
      projectId: task.projectId,
      userId: user.userId,
      action: "UPDATED_PRIORITY",
      entityType: "task",
      entityId: task.id,
      description: `Updated task "${task.title}" priority to ${priority}`,
    },
  });

  revalidatePath(`/projects/${task.projectId}`);
  return task;
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: number) {
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

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      author: {
        select: { username: true, userId: true, profilePictureUrl: true },
      },
      assignee: {
        select: { username: true, userId: true, profilePictureUrl: true },
      },
      attachments: true,
    },
  });

  if (!task) return null;

  // Basic access control: Check if user belongs to project team, is involved, OR is the project owner
  const project = await prisma.project.findUnique({
    where: { id: task.projectId },
    include: {
        projectTeams: true 
    }
  });

  const isOwner = project?.ownerUserId === user.userId;
  const isTeamMember = project?.projectTeams.some(pt => pt.teamId === user.teamId);
  const isAuthorOrAssignee = task.authorUserId === user.userId || task.assignedUserId === user.userId;

  if (!isOwner && !isTeamMember && !isAuthorOrAssignee) {
      throw new Error("Unauthorized access to task");
  }

  return task;
}
