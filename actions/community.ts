"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createPostSchema, voteSchema, createCommentSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { pusherServer } from "@/lib/pusher";

/**
 * Get all posts with optional filtering
 */
export async function getPosts(searchParams?: { userId?: number; tag?: string }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const where: any = {};
  if (searchParams?.userId) where.authorId = Number(searchParams.userId);
  if (searchParams?.tag) where.tags = { contains: searchParams.tag, mode: 'insensitive' };

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
      votes: {
        where: {
          user: { clerkId },
        },
        select: {
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  // Enhance posts with user's vote status and vote counts
  const enhancedPosts = posts.map((post) => ({
    ...post,
    userVote: post.votes[0]?.type || null as "UP" | "DOWN" | null,
    votes: undefined, // Remove the raw votes array
    voteCount: post._count.votes, // Total votes - simplified for now as per original API
  }));

  // Note: The original API was calculating "net score" but using total count in the listing logic? 
  // Let's stick to the original implementation's field mapping for now.
  // Actually, original API listing: `voteCount: post._count.votes` (Total count)
  // Original API detail: `voteCount: upvotes - downvotes` (Net score)
  // I will mimic the detail logic exactly in getPost, and list logic here.
  
  return enhancedPosts;
}

/**
 * Get a single post with comments
 */
export async function getPost(postId: number) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
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
        orderBy: {
          createdAt: "asc",
        },
      },
      votes: {
        select: {
          type: true,
          userId: true,
        }
      }
    },
  });

  if (!post) {
    return null;
  }

  // Get current user's DB ID to check their vote
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { userId: true }
  });

  const userVote = user 
    ? post.votes.find((v) => v.userId === user.userId)?.type || null 
    : null;

  const upvotes = post.votes.filter((v) => v.type === "UP").length;
  const downvotes = post.votes.filter((v) => v.type === "DOWN").length;

  const enhancedPost = {
    ...post,
    userVote: userVote as "UP" | "DOWN" | null,
    upvotes,
    downvotes,
    voteCount: upvotes - downvotes, // Net score
    votes: undefined, // Remove raw votes
  };

  return enhancedPost;
}

/**
 * Create a new post
 */
export async function createPost(data: { title: string; content: string; tags?: string }) {
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

  const validation = createPostSchema.safeParse(data);

  if (!validation.success) {
     throw new Error(validation.error.issues[0].message);
  }

  const { title, content, tags } = validation.data;

  const post = await prisma.post.create({
    data: {
      title,
      content,
      tags,
      authorId: user.userId,
    },
    include: {
      author: {
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
    action: "created_post",
    entityType: "post",
    entityId: post.id,
    metadata: { title: post.title },
  } as any);

  revalidatePath("/community");
  return post;
}

/**
 * Upvote or downvote a post
 */
export async function votePost(postId: number, type: "UP" | "DOWN") {
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

  const validation = voteSchema.safeParse({ type });
  if (!validation.success) {
    throw new Error("Invalid vote type");
  }

  // Check if vote exists
  const existingVote = await prisma.vote.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: user.userId,
      },
    },
  });

  let result;

  if (existingVote) {
    if (existingVote.type === type) {
      // Toggle off if same type (remove vote)
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
      result = { message: "Vote removed", vote: null };
    } else {
      // Change vote type
      const vote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type },
      });
      result = { message: "Vote updated", vote };
    }
  } else {
    // Create new vote
    const vote = await prisma.vote.create({
      data: {
        postId,
        userId: user.userId,
        type,
      },
    });
    result = { message: "Vote added", vote };
  }

  try {
    await pusherServer.trigger(`post-${postId}`, "vote-update", { postId });
  } catch (error) {
    console.error("Failed to trigger Pusher event:", error);
  }

  revalidatePath(`/community/${postId}`);
  revalidatePath("/community");
  
  return result;
}

/**
 * Add a comment to a post
 */
export async function createComment(postId: number, text: string) {
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

  // Inject postId into body for validation if schema requires it (checked schema, it often does implicitly)
  // Assuming createCommentSchema validates text and optionally mentions
  // Based on API route code: const validation = createCommentSchema.safeParse({ ...body, postId });
  const validation = createCommentSchema.safeParse({ text, postId });

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const { text: validatedText, mentions } = validation.data;

  const comment = await prisma.comment.create({
    data: {
      text: validatedText,
      postId,
      userId: user.userId,
      mentions: mentions ? JSON.stringify(mentions) : null,
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

  // Log activity
  await logActivity({
    userId: user.userId,
    action: "commented_on_post",
    entityType: "post",
    entityId: postId,
    metadata: { commentId: comment.id },
  } as any);

  // Trigger Pusher event
  try {
    await pusherServer.trigger(`post-${postId}`, "new-comment", comment);
  } catch (error) {
     console.error("Failed to trigger Pusher event:", error);
  }

  revalidatePath(`/community/${postId}`);
  return comment;
}
