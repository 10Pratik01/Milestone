import Loader from '@/app/(components)/Loader'
import { useAppSelector } from '@/app/redux'
import { useGetTasksQuery } from '@/state/api'
import {DisplayOption, Gantt, TaskType, ViewMode} from "@wamra/gantt-task-react"
import React, { useMemo, useState } from 'react'
import "@wamra/gantt-task-react/dist/style.css";

type Props = {
     id: string
    setIsModalNewTaskOpen: (isOpen: boolean) => void
}

type TaskTypeItems = "task" | "milestone" | "project"; 

const TimeLine = ({id, setIsModalNewTaskOpen}: Props) => {

    const isDarkMode = useAppSelector((state) => state.global.isDarkMode)
    const {data: tasks, error, isLoading } = useGetTasksQuery({projectId : Number(id)})

    const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
        viewMode: ViewMode.Month, 
        // locale: "en-US"
    })

      


    const ganttTask = useMemo(() => {
        return (
            tasks?.map((task) => (
               {
                 start: new Date(task.startDate as string),
                 end: new Date(task.dueDate as string), 
                 name: task.title,
                 id: `Task-${task.id}`, 
                 type: 'task' as TaskType, 
                 progress: task.points ?  ( task.points / 10) * 100 : 0,
                 isDisabled: false,
               })) || [] 
        )
    }, [tasks]);

    if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground h-full w-full mt-2"><Loader/></div>
      </div>
    )
  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading tasks</div>
      </div>
    )

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

    return (
    <div className='px-4 xl:px-6 '>
      <div className='flex flex-wrap items-center justify-between gap-2 py-5'>
        <h1 className='me-2 text-lg font-bold dark:text-white '>
          TimeLine
        </h1>
        <div className='relative inline-block w-64'>
          <select onChange={handleViewModeChange} value={displayOptions.viewMode} className='focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white dark:bg-gray-600 px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:text-white'>
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </div>

      <div className='overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white'>
        <div className='timeline'>
         <Gantt
            tasks={ganttTask}
            {...displayOptions}
            
          />
        </div>

         <div className="px-4 pb-5 pt-1">
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add New Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimeLine