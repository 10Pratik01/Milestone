import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedError } from "@/lib/api-response";
import { createCommentSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { pusherServer } from "@/lib/pusher";

/**
 * POST /api/community/posts/[postId]/comments
 * Add a comment to a post
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

    const body = await request.json();
    // Inject postId into body for validation
    const validation = createCommentSchema.safeParse({ ...body, postId });

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0].message,
        400,
        "VALIDATION_ERROR"
      );
    }

    const { text, mentions } = validation.data;

    const comment = await prisma.comment.create({
      data: {
        text,
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
    await pusherServer.trigger(`post-${postId}`, "new-comment", comment);

    return successResponse(comment, 201);
  } catch (error) {
    console.error("Error creating comment:", error);
    return errorResponse("Failed to create comment");
  }
}
