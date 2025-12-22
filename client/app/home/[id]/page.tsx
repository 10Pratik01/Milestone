"use client"
import Header from '@/app/(components)/Header';
import Loader from '@/app/(components)/Loader';
import { useAppSelector } from '@/app/redux';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { Priority, Project, Task, useGetProjectsQuery, useGetTasksQuery } from '@/state/api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { NotebookIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import HomePage from '../page';



const SelectedProject = () => {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  
  const {data: tasks, isLoading: tasksLoading, isError: taskError} = useGetTasksQuery({projectId}); 
  const {data: projects, isLoading: projectsLoading, isError: projectError} = useGetProjectsQuery(); 

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode); 


  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader/>
      </div>
    )
  }

  if (taskError || projectError) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        Error loading projects
      </div>
    )
  }

  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task:Task) => {
      const {priority} = task; 
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1; 
      return acc; 
    }, { }
  ); 

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key, 
    count: priorityCount[key]
  }))

    const statusCount = projects.reduce(
    (acc: Record<string, number>, project:Project) => {
      const status = project.endDate ? "Completed" : "Active"
      acc[status] = (acc[status] || 0) + 1; 
      return acc; 
    }, { }
  ); 

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key, 
    count: statusCount[key]
  })) 

  const taskColumns: GridColDef[] = [
    {field: "title", headerName: "Title", width:300},
    {field: "status", headerName: "Status", width:200},
    {field: "priority", headerName: "Priority", width:200},
    {field: "dueDate", headerName: "Due Date", width:200}
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };



  return (
    <div>
      {/* List of Projects */}
      <div>
        <HomePage />
        
      </div>
      <div className='my-2 mx-5 border border-gray-700 dark:border-black' />

      <div className="container h-full w-full bg-gray-100 bg-transparent p-8 ">
        <div className='flex justify-between'> 
          <Header name='Project Dashboard' /> 
          <div className='h-full w-40 gap-2 flex py-2 px-5 border text-white border-blue-600 bg-blue-primary rounded-md cursor-pointer hover:bg-blue-700 hover:border-blue-700'>
            <NotebookIcon className='h-5 w-5' /> 
            <Link href={`/projects/${projectId}`} className='text-[13px]'>
              View more
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-5">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Task Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.barGrid}
              />
              <XAxis dataKey="name" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={{
                  width: "min-content",
                  height: "min-content",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill={chartColors.bar} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Project Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                {projectStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Your Tasks
          </h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks}
              columns={taskColumns}
              checkboxSelection
              loading={tasksLoading}
              getRowClassName={() => "data-grid-row"}
              getCellClassName={() => "data-grid-cell"}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        </div>
      </div>
      </div>


    </div>
  )
}

export default SelectedProject