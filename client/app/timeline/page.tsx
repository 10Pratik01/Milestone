"use client"; 
import Loader from '@/app/(components)/Loader'
import { useAppSelector } from '@/app/redux'
import { useGetProjectsQuery } from '@/state/api'
import {DisplayOption, Gantt, ViewMode} from "@wamra/gantt-task-react"
import React, { useMemo, useRef, useState } from 'react'
import "@wamra/gantt-task-react/dist/style.css";
import Header from "@/app/(components)/Header"

type Props = {
     id: string
    setIsModalNewTaskOpen: (isOpen: boolean) => void
}

type TaskTypeItems = "task" | "milestone" | "project"; 

const TimeLine = ({ setIsModalNewTaskOpen}: Props) => {

    const isDarkMode = useAppSelector((state) => state.global.isDarkMode)
    const {data: projects, error, isLoading } = useGetProjectsQuery()

    const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
        viewMode: ViewMode.Month, 
        // locale: "en-US"
    })
    

      


    const ganttTask = useMemo(() => {
    return (
      projects?.map((project) => ({
        start: new Date(project.startDate as string),
        end: new Date(project.endDate as string),
        name: project.name,
        id: `Project-${project.id}`,
        type: "project" as TaskTypeItems,
        progress: 50,
        isDisabled: false,
      })) || []
    );
  }, [projects]);

  

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
      <header className="mb-4 flex items-center justify-between">
        <Header name="Projects Timeline" />
        <div className="relative inline-block w-64">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </header>

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