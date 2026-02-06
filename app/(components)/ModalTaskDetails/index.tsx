"use client";

import Modal from "@/app/(components)/Modal";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import Image from "next/image"
import { Calendar, User, Tag, Clock, Send, MessageSquare } from "lucide-react";
import { getTask } from "@/actions/tasks";
import { getTaskComments, createTaskComment } from "@/actions/comments";
import Loader from "../Loader";
import PrioritySelector from "../PrioritySelector";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
};

const ModalTaskDetails = ({ isOpen, onClose, taskId }: Props) => {
  const [task, setTask] = useState<any>(null); // Using any to avoid strict type duplication for now, ideally Task type
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [taskData, commentsData] = await Promise.all([
            getTask(taskId),
            getTaskComments(taskId)
          ]);
          setTask(taskData);
          setComments(commentsData);
        } catch (error) {
          console.error("Failed to fetch task details:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, taskId]);

  const handleSendComment = async () => {
      if(!newComment.trim() || !taskId) return;
      setIsSendingComment(true)
      try {
          const comment = await createTaskComment(taskId, newComment);
          setComments([comment, ...comments]);
          setNewComment("");
      } catch (error) {
          console.error("Failed to send comment", error)
      } finally {
          setIsSendingComment(false)
      }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Task Details">
      {isLoading || !task ? (
        <div className="flex h-64 items-center justify-center">
            <Loader />
        </div>
      ) : (
        <div className="space-y-6">
            {/* Header info */}
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold dark:text-white">{task.title}</h2>
                    <PrioritySelector taskId={task.id} currentPriority={task.priority} />
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <div className={`h-2.5 w-2.5 rounded-full ${
                             task.status === 'Completed' ? 'bg-green-500' : 
                             task.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <span>{task.status}</span>
                    </div>
                     {task.startDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(task.startDate), "MMM d, yyyy")}</span>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                        </div>
                    )}
                </div>

                 {/* Tags */}
                {task.tags && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.split(",").map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs text-blue-700 dark:text-blue-300"
                      >
                        <Tag className="h-3 w-3" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700"/>

            {/* Description */}
            <div>
                <h3 className="mb-2 font-semibold dark:text-white">Description</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {task.description || "No description provided."}
                </p>
            </div>

            <hr className="border-gray-200 dark:border-gray-700"/>

            {/* People */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <h3 className="mb-2 text-sm font-semibold dark:text-white">Assignee</h3>
                     <div className="flex items-center gap-2">
                        {task.assignee ? (
                            <>
                                {task.assignee.profilePictureUrl && 
                                    <Image src={`/${task.assignee.profilePictureUrl}`} alt={task.assignee.username} width={24} height={24} className="rounded-full w-6 h-6 object-cover"/>
                                }
                                <span className="text-sm dark:text-gray-300">{task.assignee.username}</span>
                            </>
                        ) : <span className="text-sm italic text-gray-400">Unassigned</span>}
                     </div>
                 </div>
                 <div>
                     <h3 className="mb-2 text-sm font-semibold dark:text-white">Author</h3>
                     <div className="flex items-center gap-2">
                         {task.author && (
                            <>
                                {task.author.profilePictureUrl && 
                                    <Image src={`/${task.author.profilePictureUrl}`} alt={task.author.username} width={24} height={24} className="rounded-full w-6 h-6 object-cover"/>
                                }
                                <span className="text-sm dark:text-gray-300">{task.author.username}</span>
                            </>
                        )}
                     </div>
                 </div>
             </div>

             <hr className="border-gray-200 dark:border-gray-700"/>
            
            {/* Comments Section */}
            <div className="space-y-4">
                 <h3 className="flex items-center gap-2 font-semibold dark:text-white">
                     <MessageSquare className="h-4 w-4" />
                     Comments ({comments.length})
                 </h3>

                 {/* Comment List */}
                 <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                     {comments.length === 0 ? (
                         <p className="text-sm text-gray-400 italic">No comments yet.</p>
                     ) : (
                         comments.map((comment: any) => (
                             <div key={comment.id} className="flex gap-3 text-sm">
                                 <div className="shrink-0 mt-1">
                                    {comment.user?.profilePictureUrl ? (
                                        <Image src={`/${comment.user.profilePictureUrl}`} alt={comment.user.username} width={30} height={30} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-4 w-4 text-gray-500"/>
                                        </div>
                                    )}
                                 </div>
                                 <div className="flex-1 space-y-1">
                                     <div className="flex items-center justify-between">
                                         <span className="font-semibold dark:text-gray-200">{comment.user?.username || 'Unknown'}</span>
                                         <span className="text-xs text-gray-400">{format(new Date(comment.createdAt), "MMM d, h:mm a")}</span>
                                     </div>
                                     <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                                 </div>
                             </div>
                         ))
                     )}
                 </div>

                 {/* Add Comment */}
                 <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="Write a comment..." 
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendComment(); 
                            }
                        }}
                     />
                     <button 
                        onClick={handleSendComment}
                        disabled={isSendingComment || !newComment.trim()}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                     >
                         {isSendingComment ? <Clock className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                     </button>
                 </div>
            </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalTaskDetails;
