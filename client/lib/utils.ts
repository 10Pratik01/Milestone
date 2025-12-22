export const dataGridClassNames =
  "border border-gray-200 bg-white dark:bg-black shadow ";

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    "& .MuiDataGrid-columnHeaders": {
      color: isDarkMode ? "#e5e7eb" : "",
      '& [role="row"] > *': {
        backgroundColor: isDarkMode ? "#1d1f21" : "white",
        borderColor: isDarkMode ? "#2d3135" : "#e5e7eb",
      },
    },

    "& .MuiIconButton-root": {
      color: isDarkMode ? "#a3a3a3" : "",
       backgroundColor: isDarkMode ? "#1d1f21" : "white",
    },

    "& .MuiTablePagination-root": {
      color: isDarkMode ? "#a3a3a3" : "",
       backgroundColor: isDarkMode ? "#1d1f21" : "white",
    },

    "& .MuiTablePagination-selectIcon": {
      color: isDarkMode ? "#a3a3a3" : "",
       backgroundColor: isDarkMode ? "#1d1f21" : "white",
    },

    "& .MuiDataGrid-cell": {
      border: "none",
       backgroundColor: isDarkMode ? "#1d1f21" : "white",
       color: isDarkMode ? "#e5e7eb" : "",
    },

    "& .MuiDataGrid-row": {
      borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
      backgroundColor: isDarkMode ? "#1d1f21" : "white",
    },

    "& .MuiDataGrid-withBorderColor": {
      borderColor: isDarkMode ? "#2d3135" : "#e5e7eb",
      backgroundColor: isDarkMode ? "#1d1f21" : "white",
    },
  };
};
