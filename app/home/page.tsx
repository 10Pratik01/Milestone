"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, PlusSquare } from "lucide-react"

import Header from "../(components)/Header"
import ModalNewProject from "../projects/ModalNewProject"
import Loader from "../(components)/Loader"
import { getProjects } from "@/actions/projects"
import type { Project } from "@prisma/client"

const HomePage = () => {
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader/>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        Error loading projects
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      <ModalNewProject
        isOpen={isModalNewProjectOpen}
        onClose={() => setIsModalNewProjectOpen(false)}
      />

      <Header
        name="Projects"
        buttonComponent={
          <button
            onClick={() => setIsModalNewProjectOpen(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            <PlusSquare size={18} />
            Create new project
          </button>
        }
      />

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border bg-blue-50 p-6 shadow-sm transition hover:shadow-md dark:bg-neutral-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold underline-offset-4 hover:underline">
                {project.name}
              </h2>
              <span className="text-sm text-gray-500">#{project.id}</span>
            </div>

            {/* Dates */}
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {project.startDate
                ? format(new Date(project.startDate), "P")
                : "—"}
              <ArrowRight size={16} />
              {project.endDate
                ? format(new Date(project.endDate), "P")
                : "—"}
            </div>

            {/* CTA */}
            <div className="mt-6 flex justify-end">
              <Link
                href={`/projects/${project.id}`}
                className="inline-flex items-center gap-2 rounded-md border border-blue-500 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-500 hover:text-white dark:text-blue-400"
              >
                Details
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No projects</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new project.</p>
                <div className="mt-6">
                    <button
                        onClick={() => setIsModalNewProjectOpen(true)}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        <PlusSquare className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        New Project
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
