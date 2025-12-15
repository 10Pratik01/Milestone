"use client"; 
import { useSearchQueryQuery } from '@/state/api';
import { debounce } from "lodash";
import React, { useEffect, useState } from 'react'
import Header from '../(components)/Header';
import Loader from '../(components)/Loader';
import TaskCard from '../(components)/TaskCard';
import ProjectCard from '../(components)/ProjectCard';
import UserCard from '../(components)/UserCard';



const Search = () => {
    const [searchTerm, setSearchTerm] = useState(""); 
    const {data: searchResults  ,isLoading,  isError} = useSearchQueryQuery(searchTerm, {
        skip: searchTerm.length < 3,
    }); 

    const handleSearch = debounce(
      (e : React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value); 
      }, 500,
    ); 

    console.log(searchTerm)

    useEffect(() => {
      return handleSearch.cancel; 
    }, [handleSearch.cancel])

  return ( 
    <div className='p-8'>
      <Header name="Search" />
      <div className=''>
        <input type="text" placeholder='Search....' className='w-1/2 rounded border p-3 shadow' onChange={handleSearch}/>
      </div>
      <div className='p-5'>
        {isLoading && <div className='translate-y-[-200px] '><div><Loader/></div></div>}
        {isError && <p>An error occured fetching search</p>}
        {!isLoading && !isError && searchResults && (
          <div className=''> 
            {searchResults.tasks && searchResults.tasks?.length > 0 && (
              <h2> Tasks</h2>
            )}
           
              {searchResults.tasks?.map((task) => (
                <div className='my-3'  key={task.id}> <TaskCard task={task}/></div>
              ))}
            
            {searchResults.projects && searchResults.projects?.length > 0 && (
              <h2> projects</h2>
            )}
            
              {searchResults.projects?.map((project) => (
                <div className='my-3' key={project.id}>
                  <ProjectCard  project={project}/> 
                </div>
              ))}
           
            {searchResults.users && searchResults.users?.length > 0 && (
              <h2> User</h2>
            )}
            
              {searchResults.users?.map((user) => (
                <div className='my-3' key={user.userId}><UserCard  user={user}/>  </div>
              ))}
           
          </div>
        ) }
      </div> 
    </div>
  )
}

export default Search