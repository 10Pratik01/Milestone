"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Send,
  User as UserIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Comment = {
  id: number;
  text: string;
  user: {
    username: string;
    profilePictureUrl: string | null;
  };
  createdAt: string;
};

type PostDetail = {
  id: number;
  title: string;
  content: string;
  tags: string | null;
  author: {
    username: string;
    profilePictureUrl: string | null;
  };
  createdAt: string;
  voteCount: number;
  userVote: "UP" | "DOWN" | null;
  comments: Comment[];
};

import { getPost, votePost, createComment } from "@/actions/community";

// ... existing imports

// ... existing types (Note: createdAt types might need adjustment if Prisma returns Date)

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchPost = async () => {
    try {
      const data = await getPost(Number(params.id));
      setPost(data as any); 
    } catch (error) {
      console.error("Failed to fetch post", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const handleVote = async (type: "UP" | "DOWN") => {
    if (!post) return;

    // Optimistic update
    const previousPost = { ...post };
    let newVoteCount = post.voteCount;
    let newUserVote = post.userVote;

    if (post.userVote === type) {
      // Remove vote
      newVoteCount -= (type === "UP" ? 1 : -1);
      newUserVote = null;
    } else {
      // Change/Add vote
      if (post.userVote) {
        newVoteCount += (type === "UP" ? 2 : -2);
      } else {
        newVoteCount += (type === "UP" ? 1 : -1);
      }
      newUserVote = type;
    }

    setPost({ ...post, voteCount: newVoteCount, userVote: newUserVote });

    try {
      await votePost(post.id, type);
    } catch (error) {
      // Revert on error
      setPost(previousPost);
      console.error("Failed to vote", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;

    setIsSubmittingComment(true);
    try {
      await createComment(post.id, commentText);
      setCommentText("");
      // Refresh post to see new comment
      fetchPost();
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Post not found</h2>
        <Link href="/community" className="text-blue-600 hover:underline mt-2">
          Return to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/community" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Community
        </Link>

        <div className="grid grid-cols-1 gap-6">
          {/* Main Post Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex">
              {/* Vote Sidebar */}
              <div className="flex flex-col items-center p-4 bg-gray-50 border-r border-gray-100 min-w-[4rem]">
                <button 
                  onClick={() => handleVote("UP")}
                  className={`p-1.5 rounded-lg hover:bg-gray-200 transition-colors ${post.userVote === "UP" ? "text-orange-600 bg-orange-100" : "text-gray-500"}`}
                >
                  <ArrowUp className="w-7 h-7" />
                </button>
                <span className={`text-lg font-bold my-2 ${
                  post.userVote === "UP" ? "text-orange-600" : 
                  post.userVote === "DOWN" ? "text-indigo-600" : "text-gray-700"
                }`}>
                  {post.voteCount}
                </span>
                <button 
                  onClick={() => handleVote("DOWN")}
                  className={`p-1.5 rounded-lg hover:bg-gray-200 transition-colors ${post.userVote === "DOWN" ? "text-indigo-600 bg-indigo-100" : "text-gray-500"}`}
                >
                  <ArrowDown className="w-7 h-7" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 md:p-8">
                {/* Meta */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {post.author.profilePictureUrl ? (
                      <img src={post.author.profilePictureUrl} alt="" className="w-10 h-10 rounded-full border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {post.author.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{post.author.username}</div>
                      <div className="text-xs text-gray-500">
                        Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Title & Body */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                <div className="prose prose-blue max-w-none text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 pt-6 border-t border-gray-100 text-gray-500">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">{post.comments.length} Comments</span>
                  </div>
                  <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Comments ({post.comments.length})</h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-4">
              <div className="flex-shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="What are your thoughts?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-800 placeholder:text-gray-400"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isSubmittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {post.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4 italic">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <div className="flex-shrink-0">
                      {comment.user.profilePictureUrl ? (
                        <img src={comment.user.profilePictureUrl} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                          {comment.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-2xl px-5 py-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{comment.user.username}</span>
                          <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
