"use client"
import React, { useState, useEffect } from 'react'
import {DndProvider, DropTargetMonitor, useDrag, useDrop} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import { EllipsisVertical, MessageSquareMore, Plus } from 'lucide-react'
import {format} from 'date-fns'
import Image from 'next/image'
import Loader from '@/app/(components)/Loader'
import { getTasks, updateTaskStatus } from '@/actions/tasks'
import type { Task as TaskType } from '@prisma/client' // Or inferred type

type BoardProps = {
    id: string, 
    setIsModalNewTaskOpen: (isOpen: boolean) => void
    setIsModalTaskDetailsOpen: (taskId: number) => void
}

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"]

type TasksColumnProps = {
    status : string, 
    tasks : any[], // Using any[] to handle joined data for now
    moveTask: (taskId: number, toStatus: string) => void, 
    setIsModalNewTaskOpen : (isOpen: boolean) => void;
    setIsModalTaskDetailsOpen: (taskId: number) => void
}

const BoardView = ({id, setIsModalNewTaskOpen, setIsModalTaskDetailsOpen}: BoardProps) => {
    // ... useEffect, moveTask ...
    const [tasks, setTasks] = useState<any[]>([])
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

    
    const moveTask = async (taskId: number, toStatus: string) => {
        try {
            // Optimistic update
            setTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, status: toStatus } : task
            ));
            await updateTaskStatus(taskId, toStatus);
        } catch (error) {
            console.error("Failed to update task status:", error);
            // Revert changes if needed, but for now just logging
        }
    };
  
    if(isLoading) return <div><Loader/></div>
    if(error) return (<div>Error: {error}</div>)

    return (
    <DndProvider backend={HTML5Backend}> 
    <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4'>
        {taskStatus.map((status) => (
            <TaskColumn 
                key={status}
                status ={status}
                tasks={tasks || []} 
                moveTask={moveTask}
                setIsModalNewTaskOpen={setIsModalNewTaskOpen}
                setIsModalTaskDetailsOpen={setIsModalTaskDetailsOpen}
            />
        ))}
    </div>
    </DndProvider>
  )
}

const TaskColumn = ({
    status, 
    tasks, 
    moveTask, 
    setIsModalNewTaskOpen,
    setIsModalTaskDetailsOpen
}: TasksColumnProps) => {

    const[{isOver}, drop] = useDrop(() => ({
        accept: 'task', 
        drop:(item: {id: number}) => moveTask(item.id, status),
        collect: (monitor:any) => (
            {
                isOver: !!monitor.isOver()
            }
        )

    })); 

    const tasksCount = tasks.filter((task) => task.status === status).length;

    
    const statusColor: any ={ 
        "To Do": "#2563EB" ,
        "Work In Progress": "#059669", 
        "Under Review" : "#D97706", 
        "Completed": "#000000"
    }

    return (
        <div ref={(instance) => {
            drop(instance)
        }} className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver? "bg-blue-100 dark:bg-neutral-950 ": " "}`}>
            <div className='mb-3 flex w-full'>
                <div className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`} style={{backgroundColor: statusColor[status]}}/>
                    <div className='flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary'>
                        <h3 className='flex items-center text-lg font-semibold dark:text-white'>
                             {status} {" "}
                        
                            <span className='ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary ' style={{width: "1.5rem", height: "1.5rem"}}>
                                {tasksCount}
                            </span> 
                        </h3>
                        <div className='flex items-center gap-1'>
                            <button className='flex h-6 w-5 items-center justify-center dark:text-neutral-500'>
                                <EllipsisVertical size={26}/> 
                            </button>

                            <button className='flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white'
                            onClick={() => setIsModalNewTaskOpen(true)}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {tasks.filter((task) => task.status === status).map((task) => (
                    <Task key={task.id} task={task} setIsModalTaskDetailsOpen={setIsModalTaskDetailsOpen}/> 
                ))}
            </div>
    )
}

type TasksProps = {
    task: any // Using any to handle joined data 
    setIsModalTaskDetailsOpen: (taskId: number) => void
}

const PriorityTag = ({priority} : {priority: TaskType["priority"]}) => (
        <div className={`rounded-full px-4 py-2 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700"
          : priority === "High"
            ? "bg-yellow-200 text-yellow-700"
            : priority === "Medium"
              ? "bg-green-200 text-green-700"
              : priority === "Low"
                ? "bg-blue-200 text-blue-700"
                : "bg-gray-200 text-gray-700"
      }`}>{priority}</div>
    ); 

const Task = ({task, setIsModalTaskDetailsOpen} : TasksProps) => {
    const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

    const taskTagsSplit = task.tags ? task.tags.split(",") : []; 

    const formatedStartDate = task.startDate ? format(new Date(task.startDate), "P" ) : ""; 

    const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), "P") : ""; 

    const numberOfComments = (task.comments && task.comments.length) || 0 

    return (
        <div 
        ref={(instance) => { drag(instance); }} 
        className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${ isDragging ? "opacity-50" : "opacity-100"} cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors`}
        onClick={() => setIsModalTaskDetailsOpen(task.id)}
        >
            {task.attachments && task.attachments.length > 0 && (
                <Image src={`/${task.attachments[0].fileURL}`} alt={task.attachments[0].fileName || "Task Attachment"} width={500} height={200} className='h-auto w-full rounded-t-md' /> 
            )}
            <div className='p-4 md:p-6'>
                <div className='flex items-start justify-between'>
                    <div className='flex flex-1 flex-wrap items-center gap-2'>
                        {task.priority && <PriorityTag priority={task.priority} /> }
                        <div className='flex gap-2'>
                            {taskTagsSplit.map((tag: string) => (
                                <div key={tag} className='rounded-full bg-blue-100 dark:bg-gray-900 px-4 py-2 text-xs'>
                                    {" "}
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className='flex h-6 w-4 shrink-0 items-center justify-center dark:text-neutral-500'>
                        <EllipsisVertical size={26}/> 
                    </button>
                </div>

                <div className='my-3 flex justify-between'>
                    <h4 className='text-md font-bold dark:text-white'>{task.title}</h4>
                    {typeof task.points === "number" && (
                        <div className='text-xs font-semibold dark:text-white'> 
                        {task?.points} pts
                        </div>
                    )}
                </div>
                <div className='text-xs text-gray-500 dark:text-neutral-500'>
                    {formatedStartDate && <span> {formatedStartDate} - </span>}
                    {formattedDueDate && <span> {formattedDueDate}</span>}
                </div>
                <p className='text-xs text-gray-600 dark:text-neutral-500'>
                    {task?.description}
                </p>
                <div className='mt-4 border-t border-gray-200 dark:border-stroke-dark ' /> 

                {/* Users  */}
                <div className='mt-3 flex items-center justify-between'>
                    <div className='flex -space-x-1.5 overflow-hidden'>
                    <div className='flex -space-x-1.5 overflow-hidden'>
                        {task.assignee && (
                             task.assignee.profilePictureUrl ? (
                                <Image 
                                    key={task.assignee.userId}
                                    src={`/${task.assignee.profilePictureUrl}`} 
                                    alt={task.assignee.username} 
                                    width={30} 
                                    height={30} 
                                    className='h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary' 
                                />
                             ) : (
                                <div key={task.assignee.userId} className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 border-2 border-white dark:border-dark-secondary dark:bg-zinc-800 text-xs font-semibold">
                                     {task.assignee.username.charAt(0).toUpperCase()}
                                </div>
                             )
                        )}
                        {task.author && (
                             task.author.profilePictureUrl ? (
                                <Image 
                                    key={task.author.userId}
                                    src={`/${task.author.profilePictureUrl}`} 
                                    alt={task.author.username} 
                                    width={30} 
                                    height={30} 
                                    className='h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary' 
                                /> 
                             ) : (
                                <div key={task.author.userId} className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 border-2 border-white dark:border-dark-secondary dark:bg-zinc-800 text-xs font-semibold">
                                     {task.author.username.charAt(0).toUpperCase()}
                                </div>
                             )
                        )}
                    </div>
                    </div>
                    <div className='flex items-center text-gray-500 dark:text-neutral-500'>
                        <MessageSquareMore size={20} />
                        <span className='ml-1 text-sm dark:text-neutral-400'>
                            {numberOfComments}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default BoardView