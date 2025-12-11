"use client"
import React, { useState } from "react"
import { useParams } from "next/navigation"
import ProjectHeader from "../ProjectHeader"
import BoardView from "../BoardView"
import ListView from "../ListView"
const Project = () => {
    const params = useParams()
    const id = params?.id as string | undefined

    const [activeTab, setActiveTab] = useState("Board")
    const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false)

    if (!id) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {id}
            {/* Modal new task  */}
            <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "Board" && (
                <BoardView id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
            )}

            {activeTab === "List" && (
                <ListView id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
            )}


        </div>
    )
}

export default Project;