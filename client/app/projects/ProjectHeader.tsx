import React, {useState } from 'react'
import Header from '../(components)/Header';
import { Clock, FilterIcon, Grid3x3, List, PlusSquare, Share2, Table } from 'lucide-react';
import ModalNewProject from './ModalNewProject';

type Props = {
  id:string
  activeTab: string
  setActiveTab: (tabname: string) => void
}
 
const ProjectHeader = ({activeTab, setActiveTab, id}: Props) => {
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false)
  
  const [searchInput, setSearchInput] = useState(""); 

  return (
    <div className='px-4 xl:px-6'>
      {/* Modal NEW project */}
      <ModalNewProject isOpen={isModalNewProjectOpen} onClose={() => setIsModalNewProjectOpen(!isModalNewProjectOpen)} /> 



      <div className='pb-6 pt-6 lg:pb-4 lg:pt-8'>
        <Header name="Product Design Development" buttonComponent={
          <button className='flex items-center rounded-md bg-blue-primary px-3 py-2 text-white hover:bg-blue-600' onClick={() => setIsModalNewProjectOpen(true)}>
            <PlusSquare className='h-5 w-5 mr-2'/> New Project
          </button>
        }/>
      </div>

      {/* Tabs  */}
      <div className="flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-2 pt-2 dark:border-stroke-dark md:items-center ">
        <div className="flex flex-1 items-center gap-2 md:gap-4 ">

          <TabButton 
            name="Board" 
            setActiveTab={setActiveTab} 
            activeTab={activeTab} 
            icon={<Grid3x3 className="h-5 w-5" />} 
          />

          <TabButton
            name="List"
            icon={<List className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Timeline"
            icon={<Clock className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Table"
            icon={<Table className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          /> 
        </div>

        <div className='flex items-center gap-2'>
          <button className='text-gray-500 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-gray-300 cursor-pointer hover:scale-105 transition-all ease-in-out'> 
            <FilterIcon className='h-5 w-5'/> 
          </button>

          <button className='text-gray-500 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-gray-300 cursor-pointer hover:scale-105 transition-all ease-in-out '> 
            <Share2 className='h-5 w-5'/> 
          </button>

          <div className='relative'>
            
            <input
              type="text"
              placeholder="Search task"
              className="rounded-md border border-gray-300 py-1 pl-10 pr-4 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className='border-r border-gray-500 h-[50%] absolute left-8 top-2'/>
        <Grid3x3
        className={`absolute left-2 top-[6.5px] h-4 w-4 scale-150
          ${searchInput != "" ? "dark:text-white text-blue-300" : "dark:text-neutral-500 text-gray-400"} 
          transition-all duration-300 ease-in-out 
          
        `}
      />
        
          </div>
        </div>
      </div>
    </div>
  )
}

type TabButtonProps = { 
  name: string; 
  icon: React.ReactNode; 
  setActiveTab: (tabName: string) => void; 
  activeTab: string; 
}

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name; 
  return (
    <button
      className={`cursor-pointer relative flex items-center gap-2 px-1 py-2 text-gray-500 
        hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white
        after:absolute after:-bottom-[9px] after:left-0 after:h-px after:w-full 
        sm:px-2 lg:px-4
        ${isActive ? "text-blue-600 after:bg-blue-600 dark:text-white cursor-pointer" : ""}
      `}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};


export default ProjectHeader