"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { getPosts, votePost } from "@/actions/community";
import { 
  Heart, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  Share2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Post = {
  id: number;
  title: string;
  content: string;
  author: {
    username: string;
    profilePictureUrl: string | null;
  };
  createdAt: Date; // Server action returns Date object typically, or string if serialized? Prisma returns Date.
  voteCount: number;
  userVote: "UP" | "DOWN" | null;
  _count: {
    comments: number;
  };
  tags: string | null;
};

export default function CommunityPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Server action call
      const data = await getPosts({ tag: searchQuery });
      setPosts(data as any); // Type assertion might be needed if Date serialization differs
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleVote = async (postId: number, type: "UP" | "DOWN") => {
    // Optimistic update
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        let newVoteCount = post.voteCount;
        
        // Remove vote
        if (post.userVote === type) {
          newVoteCount -= (type === "UP" ? 1 : -1);
          return { ...post, userVote: null, voteCount: newVoteCount };
        }
        
        // Change vote
        if (post.userVote) {
          newVoteCount += (type === "UP" ? 2 : -2);
        } else {
          // New vote
          newVoteCount += (type === "UP" ? 1 : -1);
        }
        
        return { ...post, userVote: type, voteCount: newVoteCount };
      }
      return post;
    }));

    try {
      await votePost(postId, type);
    } catch (error) {
      console.error("Failed to vote", error);
      // Revert on error (could reuse fetchPosts)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Community Feed</h1>
            <p className="text-gray-500 mt-1">Share your progress, ask questions, and inspire others.</p>
          </div>
          <Link 
            href="/community/create" 
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Create Post
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by tag..."
            className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
          />
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            // Skeletons
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No posts found. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="flex">
                  {/* Vote Sidebar */}
                  <div className="flex flex-col items-center p-3 bg-gray-50 border-r border-gray-100 min-w-[3.5rem]">
                    <button 
                      onClick={() => handleVote(post.id, "UP")}
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${post.userVote === "UP" ? "text-orange-600 bg-orange-50" : "text-gray-500"}`}
                    >
                      <ArrowUp className="w-6 h-6" />
                    </button>
                    <span className={`text-sm font-bold my-1 ${
                      post.userVote === "UP" ? "text-orange-600" : 
                      post.userVote === "DOWN" ? "text-indigo-600" : "text-gray-700"
                    }`}>
                      {post.voteCount}
                    </span>
                    <button 
                      onClick={() => handleVote(post.id, "DOWN")}
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${post.userVote === "DOWN" ? "text-indigo-600 bg-indigo-50" : "text-gray-500"}`}
                    >
                      <ArrowDown className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    {/* Meta */}
                    <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
                      <div className="flex items-center gap-1.5 font-medium text-gray-900">
                        {post.author.profilePictureUrl ? (
                          <img src={post.author.profilePictureUrl} alt="" className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                            {post.author.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{post.author.username}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    </div>

                    {/* Title & Body */}
                    <Link href={`/community/${post.id}`}>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 line-clamp-3 mb-4 text-sm leading-relaxed">
                        {post.content}
                      </p>
                    </Link>

                    {/* Tags */}
                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.split(',').map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-gray-500 text-sm border-t border-gray-100 pt-3 mt-auto">
                      <Link 
                        href={`/community/${post.id}`}
                        className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{post._count.comments} Comments</span>
                      </Link>
                      <button className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1 rounded transition-colors group">
                        <Share2 className="w-4 h-4 group-hover:text-blue-600" />
                        <span className="group-hover:text-gray-700">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
