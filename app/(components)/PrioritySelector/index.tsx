"use client";

import { useState } from "react";
import { updateTaskPriority } from "@/actions/tasks";
import { Flag } from "lucide-react";

const PRIORITIES = ["Urgent", "High", "Medium", "Low", "Backlog"];

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "bg-red-600 hover:bg-red-700";
    case "high":
      return "bg-orange-600 hover:bg-orange-700";
    case "medium":
      return "bg-yellow-600 hover:bg-yellow-700";
    case "low":
      return "bg-green-600 hover:bg-green-700";
    case "backlog":
      return "bg-gray-600 hover:bg-gray-700";
    default:
      return "bg-blue-600 hover:bg-blue-700";
  }
};

export default function PrioritySelector({
  taskId,
  currentPriority,
}: {
  taskId: number;
  currentPriority?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true);
    try {
      await updateTaskPriority(taskId, newPriority);
      setIsOpen(false);
      // Refresh the page to show updated priority
      window.location.reload();
    } catch (error) {
      console.error("Failed to update priority:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        disabled={isUpdating}
      >
        <Flag className="h-3 w-3" />
        Change Priority
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-2 space-y-1">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  disabled={isUpdating}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    currentPriority?.toLowerCase() === priority.toLowerCase()
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-medium"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getPriorityColor(
                        priority
                      )}`}
                    />
                    {priority}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
