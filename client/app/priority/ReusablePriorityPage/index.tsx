"use client";

import Header from "@/app/(components)/Header";
import ModalNewTask from "@/app/(components)/ModalNewTask";
import TaskCard from "@/app/(components)/TaskCard";
import { useAppSelector } from "@/app/redux";

import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
  useGetTasksByUserQuery,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { PlusSquare } from "lucide-react";
import React, { useState } from "react";

type Props = {
  priority: Priority;
};

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
    renderCell: (params) => params.value.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value.username || "Unassigned",
  },
];

const  ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const userId = 1; 


  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId || 0, {
    skip: userId === null,
  });

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  );

  if (isTasksError || !tasks) return <div>Error fetching tasks</div>;

  return (
  <div className="mx-6 my-5">
    <ModalNewTask
      isOpen={isModalNewTaskOpen}
      onClose={() => setIsModalNewTaskOpen(false)}
    />

    {/* Header */}
    <div className="mb-6 flex items-center justify-between">
      <div>
        <Header name={`${priority} Priority Tasks`} />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage and track tasks with {priority} priority
        </p>
      </div>

      <button
        onClick={() => setIsModalNewTaskOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
      >
        <PlusSquare className="h-4 w-4" />
        Add Task
      </button>
    </div>

    {/* View Toggle */}
    <div className="mb-6 inline-flex overflow-hidden rounded-lg border dark:border-gray-700">
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-2 px-4 py-2 text-sm transition
          ${view === "list"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-800"}
        `}
      >
        List
      </button>

      <button
        onClick={() => setView("table")}
        className={`flex items-center gap-2 px-4 py-2 text-sm transition
          ${view === "table"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-800"}
        `}
      >
        Table
      </button>
    </div>

    {/* Content */}
    {isLoading ? (
      <div className="flex h-40 items-center justify-center">
        Loading tasks…
      </div>
    ) : filteredTasks?.length === 0 ? (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed text-center dark:border-gray-700">
        <h2 className="text-lg font-semibold">
          No {priority} priority tasks 🎉
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          You’re all caught up. Add a new task if needed.
        </p>
      </div>
    ) : view === "list" ? (
      <div className="flex flex-wrap  gap-10 ">
        {filteredTasks?.map((task: Task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    ) : (
      <div className="rounded-xl bg-white p-4 shadow dark:bg-dark-secondary">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Tasks Table
          </h3>
          <span className="text-xs text-gray-500">
            {filteredTasks?.length} tasks
          </span>
        </div>

        <DataGrid
          rows={filteredTasks}
          columns={columns}
          checkboxSelection
          getRowId={(row) => row.id}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
          autoHeight
        />
      </div>
    )}
  </div>
);

};

export default ReusablePriorityPage;
