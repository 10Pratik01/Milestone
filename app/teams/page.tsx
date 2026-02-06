"use client";
import { getTeams } from '@/actions/teams';
import Header from '@/app/(components)/Header'
import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../redux'
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid'
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils'

const CustomToolbar = () => (
   <GridToolbarContainer className='toolbar flex gap-2'>
       <GridToolbarFilterButton /> 
       <GridToolbarExport /> 
   </GridToolbarContainer>
)

const columns: GridColDef[] = [
   { field: "id", headerName: "ID", width: 50}, 
   { field: "teamName", headerName:"Team Name", width: 200}, 
   { field: "productOwnerUserId", headerName:"Product Owner", width: 200}, 
   { field: "projectManagerUserId", headerName:"Project Manager", width: 200}, 
]

const Teams = () => {
   const [teams, setTeams] = useState<any[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [isError, setIsError] = useState(false)

   useEffect(() => {
    const fetchTeams = async () => {
        try {
            setIsLoading(true)
            const data = await getTeams()
            setTeams(data)
        } catch (error) {
             console.error("Failed to fetch teams", error)
             setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }
    fetchTeams()
   }, [])

   const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

   if(isLoading) return <div>Loading...</div>
   if(isError) return <div>Error fetching teams</div>
   
 return (
   <div className='flex w-full flex-col p-6'>
       <Header name="Teams" />
       <div style={{ height: 650, width: "100%"}}>
           <DataGrid 
               rows={teams || []}
               columns={columns}
               pagination
               slots={{
                   toolbar: CustomToolbar
               }}
               className={dataGridClassNames}
               sx={dataGridSxStyles(isDarkMode)}
           />
       </div>

   </div>
 )
}

export default Teams