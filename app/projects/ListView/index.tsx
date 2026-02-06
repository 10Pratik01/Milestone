"use client"

import Header from "@/app/(components)/Header"
import TaskCard from "@/app/(components)/TaskCard"
import { Plus } from "lucide-react"
import Loader from "@/app/(components)/Loader"
import { getTasks } from "@/actions/tasks"
import type { Task } from "@prisma/client"
import React, { useState, useEffect } from "react"


type ListProps = {
  id: string
  setIsModalNewTaskOpen: (isOpen: boolean) => void
  setIsModalTaskDetailsOpen: (taskId: number) => void
}

const ListView = ({ id, setIsModalNewTaskOpen, setIsModalTaskDetailsOpen }: ListProps) => {
  const [tasks, setTasks] = useState<any[]>([]) // Using any[] temporarily if Task type mismatch with includes, strictly it should be return type of getTasks
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const data = await getTasks(Number(id))
        setTasks(data)
      } catch (err) {
        setError("Error loading tasks")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [id])

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader/>
      </div>
    )
  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{error}</div>
    </div>
     
    )

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="List"
          buttonComponent={
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 bg-blue-primary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          }
          isSmallText
        />
      </div>

      {tasks && tasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5 mt-6">
          {tasks.map((task: any) => (
            <TaskCard 
                key={task.id} 
                task={task} 
                onClick={(task) => setIsModalTaskDetailsOpen(task.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-muted-foreground text-center">
            <p className="text-lg font-medium mb-1">No tasks yet</p>
            <p className="text-sm">Create your first task to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListView
