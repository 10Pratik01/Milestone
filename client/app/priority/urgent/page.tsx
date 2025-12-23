import React from 'react'
import { Priority } from '@/state/api'
import ReusablePriorityPage from '../reusablePriorityPage'

const Urgent = () => {
  return (
    <div>
        <ReusablePriorityPage priority={Priority.Urgent} /> 
    </div>
  )
}

export default Urgent