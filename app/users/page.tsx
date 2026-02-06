"use client";
import { getUsers } from '@/actions/users';
import Header from '@/app/(components)/Header'
import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../redux'
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid'
import Image from 'next/image'
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils'

const CustomToolbar = () => (
    <GridToolbarContainer className='toolbar flex gap-2'>
        <GridToolbarFilterButton />
        <GridToolbarExport />
    </GridToolbarContainer>
)

const columns: GridColDef[] = [
    { field: "userId", headerName: "ID", width: 50},
    { field: "username", headerName:"Username", width: 150},
    { field: "profilePictureUrl", headerName:"Profile Picture", width: 100,
        renderCell: (params) => (
            <div className='flex h-full w-full items-center justify-center '>
                <div className='h-9 w-9'>
                    <Image
                        src={`/${params.value}`}
                        alt={params.row.username}
                        width={100}
                        height={100}
                        className='h-full rounded-full object-cover'
                    />
                </div>
            </div>
        )
    },
    {
      field:"teamId", headerName:"TeamId", width: 100,
    }
]

const Users = () => {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
             try {
                 setIsLoading(true)
                 const data = await getUsers()
                 setUsers(data)
             } catch (error) {
                 console.error("Failed to fetch users", error)
                 setIsError(true)
             } finally {
                 setIsLoading(false)
             }
        }
        fetchUsers()
    }, [])

    const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

    if(isLoading) return <div>Loading...</div>
    if(isError) return <div>Error fetching users</div>

  return (
    <div className='flex w-full flex-col p-6'>
        <Header name="Users" />
        <div style={{ height: 650, width: "100%"}}>
            <DataGrid
                rows={users || []}
                columns={columns}
                getRowId={(row) => row.userId}
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

export default Users