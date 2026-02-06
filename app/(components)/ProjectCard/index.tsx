import { Project } from '@prisma/client'
import React from 'react'
import { format } from 'date-fns'

type Props = {
    project: Project
}

const ProjectCard = ({project}: Props) => {
  return (
    <div className='rounded border p-4 shadow'>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <p>Start Date: {project.startDate ? format(new Date(project.startDate), 'P') : 'Not set'}</p>
        <p>End Date: {project.endDate ? format(new Date(project.endDate), 'P') : 'Not set'}</p>
    </div>
  )
}

export default ProjectCard