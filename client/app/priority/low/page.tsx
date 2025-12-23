import React from 'react'
import ReusablePriorityPage from '../reusablePriorityPage'
import { Priority } from '@/state/api'


const Low = () => {
  return (
    <div>
        <ReusablePriorityPage priority={Priority.Low} />
    </div>
  )
}

export default Low