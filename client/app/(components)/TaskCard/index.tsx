import type { Task } from "@/state/api"
import { format } from "date-fns"
import Image from "next/image"
import { Calendar, User, Tag, Flag } from "lucide-react"

type Props = {
  task: Task
}

const getStatusAccent = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "done":
      return "bg-green-500"
    case "in progress":
      return "bg-blue-500"
    case "blocked":
      return "bg-red-500"
    default:
      return "bg-gray-400"
  }
}

const getStatusBadge = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "done":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    case "in progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "blocked":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getPriorityBadge = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
    case "low":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const Avatar = ({ name }: { name: string }) => (
  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
    {name.charAt(0).toUpperCase()}
  </div>
)

const TaskCard = ({ task }: Props) => {
  return (
    <div className="bg-amber-50/50 dark:bg-zinc-900/50 group relative min-w-[300px] max-w-[400px] px-2 py-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Status Accent */}
      <div className={`absolute left-0 h-6 top-0  w-full ${getStatusAccent(task.status)}`} />

      {/* Attachment Preview */}
      {task.attachments != undefined && task.attachments?.length > 0 && (
        <div className="relative h-36 w-full overflow-hidden">
          <Image
            src={`/${task.attachments[0]?.fileURL}`}
            alt={task.attachments[0].fileName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="space-y-1 mt-1.5">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(task.status)}`}>
            {task.status ?? "No Status"}
          </span>
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityBadge(task.priority)}`}>
            <Flag className="h-3 w-3" />
            {task.priority ?? "No Priority"}
          </span>
        </div>

        {/* Tags */}
        {task.tags && (
          <div className="flex flex-wrap gap-1">
            {task.tags.split(",").map((tag, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-1 text-[11px]"
              >
                <Tag className="h-3 w-3" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {task.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Start · {format(new Date(task.startDate), "MMM d, yyyy")}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Due · {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3 text-xs">
          <div className="flex items-center gap-2">
            {task.author && <Avatar name={task.author.username} />}
            <span className="text-muted-foreground">
              {task.author?.username ?? "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {task.assignee ? (
              <>
                <Avatar name={task.assignee.username} />
                <span>{task.assignee.username}</span>
              </>
            ) : (
              <span className="italic text-muted-foreground">Unassigned</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
