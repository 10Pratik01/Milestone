import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedError, notFoundError } from "@/lib/api-response";

/**
 * GET /api/community/posts/[postId]
 * Get a single post with comments
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorizedError();

    const { postId: postIdStr } = await params;
    const postId = Number(postIdStr);
    if (isNaN(postId)) {
      return errorResponse("Invalid post ID", 400);
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
      return notFoundError("Post");
    }

    // Get current user's DB ID to check their vote
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { userId: true }
    });

    const userVote = user 
      ? post.votes.find(v => v.userId === user.userId)?.type || null 
      : null;

    const upvotes = post.votes.filter(v => v.type === "UP").length;
    const downvotes = post.votes.filter(v => v.type === "DOWN").length;

    const enhancedPost = {
      ...post,
      userVote,
      upvotes,
      downvotes,
      voteCount: upvotes - downvotes, // Net score
      votes: undefined, // Remove raw votes
    };

    return successResponse(enhancedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    return errorResponse("Failed to fetch post");
  }
}
