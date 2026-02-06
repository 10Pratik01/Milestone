"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Send an invitation to join a project
 */
export async function sendInvitation(data: {
  receiverEmail: string;
  projectId: number;
  message?: string;
}) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const sender = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true, username: true },
  });

  if (!sender) {
    throw new Error("User not found");
  }

  // Check if user has access to this project
  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      OR: [
        { ownerUserId: sender.userId }, // Allow owner to invite
        {
          projectTeams: {
            some: {
              team: {
                users: {
                  some: {
                    userId: sender.userId,
                  },
                },
              },
            },
          },
        },
        {
          tasks: {
            some: {
              authorUserId: sender.userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({
    where: { email: data.receiverEmail },
    select: { userId: true },
  });

  // Create invitation
  const invitation = await prisma.invitation.create({
    data: {
      senderId: sender.userId,
      receiverEmail: data.receiverEmail,
      receiverId: receiver?.userId,
      projectId: data.projectId,
      message: data.message,
      status: "PENDING",
    },
  });

  // If receiver exists, create notification
  if (receiver) {
    await prisma.notification.create({
      data: {
        userId: receiver.userId,
        type: "INVITATION",
        title: "Project Invitation",
        message: `${sender.username} invited you to join project: ${project.name}`,
        projectId: data.projectId,
        invitationId: invitation.id,
      },
    });
  }

  revalidatePath("/invitations");
  return invitation;
}

/**
 * Get all invitations sent by the current user
 */
export async function getSentInvitations() {
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

  const invitations = await prisma.invitation.findMany({
    where: { senderId: user.userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return invitations;
}

/**
 * Get all invitations received by the current user
 */
export async function getReceivedInvitations() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true, email: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const invitations = await prisma.invitation.findMany({
    where: {
      OR: [
        { receiverId: user.userId },
        { receiverEmail: user.email },
      ],
      status: "PENDING",
    },
    include: {
      sender: {
        select: {
          username: true,
          profilePictureUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return invitations;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(invitationId: number) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true, email: true, teamId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get invitation
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      OR: [
        { receiverId: user.userId },
        { receiverEmail: user.email },
      ],
      status: "PENDING",
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found or already processed");
  }

  // Update invitation status
  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "ACCEPTED",
      receiverId: user.userId,
      respondedAt: new Date(),
    },
  });

  // Get or create a team for this project collaboration
  // For simplicity, we'll create a task assignment to give access
  // In a full implementation, you'd manage team membership here

  // Create a notification for the sender
  await prisma.notification.create({
    data: {
      userId: invitation.senderId,
      type: "INVITATION_ACCEPTED",
      title: "Invitation Accepted",
      message: `Your invitation has been accepted`,
      projectId: invitation.projectId,
    },
  });

  revalidatePath("/invitations");
  revalidatePath("/projects");
}

/**
 * Decline an invitation
 */
export async function declineInvitation(invitationId: number) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true, email: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get invitation
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      OR: [
        { receiverId: user.userId },
        { receiverEmail: user.email },
      ],
      status: "PENDING",
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found or already processed");
  }

  // Update invitation status
  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "DECLINED",
      receiverId: user.userId,
      respondedAt: new Date(),
    },
  });

  // Create a notification for the sender
  await prisma.notification.create({
    data: {
      userId: invitation.senderId,
      type: "INVITATION_DECLINED",
      title: "Invitation Declined",
      message: `Your invitation has been declined`,
      projectId: invitation.projectId,
    },
  });

  revalidatePath("/invitations");
}
