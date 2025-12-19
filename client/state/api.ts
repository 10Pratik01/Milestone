import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Interfaces
export interface Project{
    id: number,
    name: string, 
    description: string, 
    startDate: string, 
    endDate: string
}

export enum Priority {
    Urgent = "Urgent", 
    High ="High", 
    Medium="Medium", 
    Low="Low",
    Backlog="Backlog"
}

export enum Status{
    ToDo= "To Do", 
    WorkInProgress ="Work In Progress", 
    UnderReview = "Under Review", 
    Completed = "Completed"
}

export interface User {
     userId?: string, 
     username: string, 
     email: string, 
     profilePictureUrl: string,
     cognitoId?: string, 
     teamId?: number
}

export interface Attachment {
     id: number, 
     fileURL: string, 
     fileName: string, 
     taskId: number, 
     uploadByDate: number 
}

export interface Task {
    id: number, 
    title : string, 
    description? : string, 
    status? : Status, 
    priority? : Priority, 
    tags? : string,
    startDate? : string,
    dueDate? : string,
    points? : number,
    projectId? : number,
    authorUserId? : number, 
    assignedUserId? : number, 

    author?: User;
    assignee?: User;
    comments?: Comment[];
    attachments?: Attachment[]; 
}

export interface SearchResult {
    tasks?: Task[]; 
    projects?: Project[]; 
    users?: User[];
}

export interface Team {
    teamId: number; 
    teamName: string; 
    productOwnerUserId?: number
    projectManagerUserId?: number
}

export const api= createApi({
    baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL}),
    reducerPath: "api", 
    tagTypes:["Projects", "Tasks", "Users", "Teams"], 
    endpoints:(build) => ({
        getProjects: build.query<Project[], void>({
            query: () => "projects", 
            providesTags: ["Projects"], 
        }),
        createProject: build.mutation<Project, Partial<Project>>({
            query: (project) => ({
                url:"projects",
                method:"POST", 
                body:project
            }),
            invalidatesTags: ["Projects"]
        }), 

        getTasks: build.query<Task[], { projectId: number }>({
                query: ({ projectId }) => `tasks?projectId=${projectId}`,
                providesTags: (result) => 
                    {if (Array.isArray(result)) {
                    return result.map(({ id }) => ({ type: "Tasks" as const, id }));
                    }
                    return [{ type: "Tasks" as const }]; }// Fallback in case `result` is not an array
            }),

        createTask: build.mutation<Task, Partial<Task>>({
            query: (tasks) => ({
                url: "tasks", 
                method:"POST",
                body:tasks
            }), 
            invalidatesTags:["Tasks"]
        }),
        
        updateTaskStatus: build.mutation<Task, {taskId : number, status: string}>({
            query: ({taskId , status}) =>({
                url: `tasks/${taskId}/status`,
                method:"PATCH",
                body:{status}
            }), 
            invalidatesTags:(result, error, {taskId}) => [
                {type: "Tasks", id:taskId},
            ], 
        }), 

        searchQuery: build.query<SearchResult, string>({
            query: (search) => `search?query=${search}`,
        }),

        getUsers: build.query<User[], void>({
            query: () => `users/everyone`,
            providesTags: ["Users"]
        }), 

        getTeams: build.query<Team[], void>({
            query: () => `teams/everyone`, 
            providesTags: ["Teams"]
        })


    }),
})


export const {
    useGetProjectsQuery,
    useCreateProjectMutation,
    useGetTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskStatusMutation, 
    useSearchQueryQuery, 
    useGetUsersQuery, 
    useGetTeamsQuery,
} = api; 