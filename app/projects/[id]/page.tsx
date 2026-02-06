"use client"
import React, { useState } from "react"
import { useParams } from "next/navigation"
import ProjectHeader from "../ProjectHeader"
import BoardView from "../BoardView"
import ListView from "../ListView"
import Timeline from "../TimeLineView"
import Table from "../Table"
import ModalNewTask from "@/app/(components)/ModalNewTask"
import ModalTaskDetails from "@/app/(components)/ModalTaskDetails"

const Project = () => {
    const params = useParams()
    const id = params?.id as string | undefined

    const [activeTab, setActiveTab] = useState("Board")
    const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false)
    const [isModalTaskDetailsOpen, setIsModalTaskDetailsOpen] = useState(false)
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

    const handleTaskClick = (taskId: number) => {
        setSelectedTaskId(taskId)
        setIsModalTaskDetailsOpen(true)
    }

    if (!id) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {/* Modal new task  */}
            <ModalNewTask id={id}  isOpen={isModalNewTaskOpen} onClose={() => setIsModalNewTaskOpen(false)} />
            
            {/* Task Details Modal */}
            <ModalTaskDetails 
                isOpen={isModalTaskDetailsOpen} 
                onClose={() => setIsModalTaskDetailsOpen(false)} 
                taskId={selectedTaskId}
            />

            <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} id={id}/>

            {activeTab === "Board" && (
                <BoardView id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} setIsModalTaskDetailsOpen={handleTaskClick} />
            )}

            {activeTab === "List" && (
                <ListView id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} setIsModalTaskDetailsOpen={handleTaskClick}/>
            )}

            {activeTab === "Timeline" && (
                <Timeline id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} setIsModalTaskDetailsOpen={handleTaskClick}/>
            )}

            {activeTab === "Table" && (
                <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} setIsModalTaskDetailsOpen={handleTaskClick}/>
            )}


        </div>
    )
}

export default Project;