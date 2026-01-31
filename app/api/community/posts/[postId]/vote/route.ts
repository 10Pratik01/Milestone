import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedError } from "@/lib/api-response";
import { voteSchema } from "@/lib/validators";
import { pusherServer } from "@/lib/pusher";

/**
 * POST /api/community/posts/[postId]/vote
 * Upvote or downvote a post
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorizedError();

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const { postId: postIdStr } = await params;
    const postId = Number(postIdStr);
    if (isNaN(postId)) {
      return errorResponse("Invalid post ID", 400);
    }

    const body = await request.json();
    const validation = voteSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Invalid vote type", 400);
    }

    const { type } = validation.data;

    // Check if vote exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.userId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Toggle off if same type (remove vote)
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        await pusherServer.trigger(`post-${postId}`, "vote-update", { postId });
        return successResponse({ message: "Vote removed", vote: null });
      } else {
        // Change vote type
        const vote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        await pusherServer.trigger(`post-${postId}`, "vote-update", { postId });
        return successResponse({ message: "Vote updated", vote });
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
      await pusherServer.trigger(`post-${postId}`, "vote-update", { postId });
      return successResponse({ message: "Vote added", vote });
    }
  } catch (error) {
    console.error("Error voting:", error);
    return errorResponse("Failed to vote");
  }
}
