import type { Task } from "@/state/api"
import { format } from "date-fns"
import Image from "next/image"
import { Calendar, User, Tag } from "lucide-react"

type Props = {
  task: Task
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "done":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    case "in progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "todo":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    case "blocked":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  }
}

const TaskCard = ({ task }: Props) => {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:bg-card dark:text-card-foreground">
      {task.attachments && task.attachments.length > 0 && (
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          <Image
            src={`/${task.attachments[0].fileURL}`}
            alt={task.attachments[0].fileName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-xl font-semibold text-primary line-clamp-2 flex-1">{task.title}</h3>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">#{task.id}</span>
          </div>
          {task.description && <p className="text-[12px] text-muted-foreground line-clamp-2">{task.description}</p>}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
          >
            {task.status || "No Status"}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
          >
            {task.priority || "No Priority"}
          </span>
        </div>

        {task.tags && (
          <div className="mb-3 flex flex-wrap gap-1">
            {task.tags.split(",").map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-1 text-xs text-secondary-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="mb-3 space-y-1 text-xs">
          {task.startDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Started: {format(new Date(task.startDate), "MMM d")}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Due: {format(new Date(task.dueDate), "MMM d")}</span>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3 space-y-1 text-xs">
          {task.author && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>By {task.author.username}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Assigned to {task.assignee.username}</span>
            </div>
          )}
          {!task.assignee && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="italic">Unassigned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard
