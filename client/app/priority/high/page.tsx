import React from 'react'
import ReusablePriorityPage from '../reusablePriorityPage'
import { Priority } from '@/state/api'



const High = () => {
  return (
    <div>
        <ReusablePriorityPage priority={Priority.High} /> 
    </div>
  )
}

export default High