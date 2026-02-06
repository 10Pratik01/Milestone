"use client";

import { search } from '@/actions/search';
import Header from "@/app/(components)/Header";
import ProjectCard from "@/app/(components)/ProjectCard";
import TaskCard from "@/app/(components)/TaskCard";
import UserCard from "@/app/(components)/UserCard";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{ tasks?: any[], projects?: any[], users?: any[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSearch = async (term: string) => {
       if (!term || term.length < 3) return;
       setIsLoading(true);
       try {
           const results = await search(term);
           setSearchResults(results);
           setIsError(false);
       } catch(e) {
           console.error("Search failed", e);
           setIsError(true);
       } finally {
           setIsLoading(false);
       }
  }

  useEffect(() => {
    const delaySearch = setTimeout(() => {
        if(searchTerm) {
          handleSearch(searchTerm)
        } else {
            setSearchResults({})
        }
    }, 500)
    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  return (
    <div className="p-8">
      <Header name="Search" />
      <div>
        <input
          type="text"
          placeholder="Search..."
          className="w-1/2 rounded border p-3 shadow"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="p-5">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error occurred while fetching search results.</p>}
        {!isLoading && !isError && searchResults && (
          <div>
            {searchResults.tasks && searchResults.tasks.length > 0 && (
              <h2 className="mb-2 text-2xl font-bold dark:text-white">Tasks</h2>
            )}
            <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {searchResults.tasks?.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            {searchResults.projects && searchResults.projects.length > 0 && (
              <h2 className="mb-2 text-2xl font-bold dark:text-white"> Projects</h2>
            )}
            <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {searchResults.projects?.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {searchResults.users && searchResults.users.length > 0 && (
              <h2 className="mb-2 text-2xl font-bold dark:text-white"> Users</h2>
            )}
            <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {searchResults.users?.map((user: any) => (
                <UserCard key={user.userId} user={user} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;