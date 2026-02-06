"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get all projects for the current user
 * Users can only see projects they created or are part of via team
 */
export async function getProjects() {
  const authObject = await auth();
  const { userId: clerkId } = authObject;
  
  console.log("getProjects Debug:", { 
      clerkId, 
      sessionId: authObject.sessionId, 
      userId: authObject.userId,
      path: "actions/projects.ts"
  });
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true, teamId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get projects where user is part of the team OR is the owner
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerUserId: user.userId }, // Projects owned by user
        // Projects where user's team is assigned
        {
          projectTeams: {
            some: {
              teamId: user.teamId ?? undefined,
            },
          },
        },
        // Projects where user has tasks (as author or assignee)
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
        // Projects where the user has improved accepted invitation
        {
          invitations: {
            some: {
              receiverId: user.userId,
              status: "ACCEPTED",
            },
          },
        },
      ],
    },
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
      // Include accepted invitations to confirm access source if needed (optional)
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

/**
 * Create a new project
 */
export async function createProject(data: {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
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

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: "active",
      ownerUserId: user.userId, // Set the owner
      // If user has a team, associate the project with that team
      ...(user.teamId && {
        projectTeams: {
          create: {
            teamId: user.teamId,
          },
        },
      }),
    },
  });

  // Create a log entry
  await prisma.projectLog.create({
    data: {
      projectId: project.id,
      userId: user.userId,
      action: "CREATED_PROJECT",
      entityType: "project",
      entityId: project.id,
      description: `Created project "${project.name}"`,
    },
  });

  revalidatePath("/projects");
  return project;
}

/**
 * Get a single project by ID (with access check)
 */
export async function getProject(projectId: number) {
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

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerUserId: user.userId }, // Access if owner
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
         {
          invitations: {
            some: {
              receiverId: user.userId,
              status: "ACCEPTED",
            },
          },
        },
      ],
    },
    include: {
      tasks: true,
      projectTeams: {
        include: {
          team: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  return project;
}

/**
 * Get all users associated with a project (Owner, Team Members, Invitees)
 */
export async function getProjectUsers(projectId: number) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      invitations: {
        where: { status: "ACCEPTED" },
        include: { receiver: true },
      },
      projectTeams: {
        include: {
          team: {
            include: {
              users: true,
            },
          },
        },
      },
    },
  });

  if (!project) return [];

  const users = new Map<number, { userId: number; username: string; profilePictureUrl: string | null }>();

  // Add Owner
  if (project.owner) {
    users.set(project.owner.userId, {
      userId: project.owner.userId,
      username: project.owner.username,
      profilePictureUrl: project.owner.profilePictureUrl,
    });
  }

  // Add Invited Users
  project.invitations.forEach((invitation) => {
    if (invitation.receiver) {
      users.set(invitation.receiver.userId, {
        userId: invitation.receiver.userId,
        username: invitation.receiver.username,
        profilePictureUrl: invitation.receiver.profilePictureUrl,
      });
    }
  });

  // Add Team Members
  project.projectTeams.forEach((pt) => {
    pt.team.users.forEach((user) => {
      users.set(user.userId, {
        userId: user.userId,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
      });
    });
  });

  return Array.from(users.values());
}
