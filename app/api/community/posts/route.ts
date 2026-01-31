import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedError } from "@/lib/api-response";
import { createPostSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

/**
 * GET /api/community/posts
 * Get all posts with optional filtering
 */
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const tag = searchParams.get("tag");

    const where: any = {};
    if (userId) where.authorId = Number(userId);
    if (tag) where.tags = { contains: tag, mode: 'insensitive' };

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
    // Note: To do this properly, we should aggregate UP/DOWN votes separately
    // But for now simple count is okay, and we check if user voted
    const enhancedPosts = posts.map((post: any) => ({
      ...post,
      userVote: post.votes[0]?.type || null,
      votes: undefined, // Remove the raw votes array
      voteCount: post._count.votes, // Total votes
    }));

    return successResponse(enhancedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return errorResponse("Failed to fetch posts");
  }
}

/**
 * POST /api/community/posts
 * Create a new post
 */
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorizedError();

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0].message,
        400,
        "VALIDATION_ERROR"
      );
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
      action: "created_post", // Add this to ActivityAction type if strict
      entityType: "post",
      entityId: post.id,
      metadata: { title: post.title },
    } as any);

    return successResponse(post, 201);
  } catch (error) {
    console.error("Error creating post:", error);
    return errorResponse("Failed to create post");
  }
}
