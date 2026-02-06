import Loader from '@/app/(components)/Loader'
import { useAppSelector } from '@/app/redux'
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "../../../lib/utils";
import React, { useState, useEffect } from 'react'
import Header from '@/app/(components)/Header';
import { getTasks } from '@/actions/tasks';

type Props = {
    id: string
    setIsModalNewTaskOpen: (isOpen: boolean) => void
    setIsModalTaskDetailsOpen: (taskId: number) => void
}

const Table = ({id, setIsModalNewTaskOpen, setIsModalTaskDetailsOpen}: Props) => {
 const isDarkMode = useAppSelector((state) => state.global.isDarkMode)
 const [tasks, setTasks] = useState<any[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const data = await getTasks(Number(id))
        setTasks(data)
      } catch (err) {
        setError("Error loading tasks")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasks()
  }, [id])


  if (isLoading)
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground h-full w-full mt-2"><Loader/></div>
        </div>
      )
    if (error)
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading tasks</div>
        </div>
      )


  return (
   <div className="h-[540px] w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="Table"
          buttonComponent={
            <button
              className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Add Task
            </button>
          }
          isSmallText
        />
      </div>
      <DataGrid
        rows={tasks || []}
        columns={columns}
        className="border border-gray-200 bg-white shadow  dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200"
        sx={dataGridSxStyles(isDarkMode)}
        onRowClick={(params) => setIsModalTaskDetailsOpen(params.row.id)}
      />
    </div>
  )
}


const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value?.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value?.username || "Unassigned",
  },
];

export default Table