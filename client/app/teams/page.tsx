"use client"; 
import { useGetTeamsQuery} from '@/state/api'
import { useAppSelector } from '../redux';
import Loader from '../(components)/Loader';
import Header from '../(components)/Header';
import { DataGrid, } from '@mui/x-data-grid';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import Image from 'next/image';
import { GridColDef } from '@mui/x-data-grid';



const Users = () => {
    const {data:teams, isLoading, isError} = useGetTeamsQuery(); 
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

    console.log(teams)

    if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground h-full w-full mt-2"><Loader/></div>
      </div>
    )
  if (isError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading Teams</div>
      </div>
    )
  

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "teamName", headerName: "Team Name", width: 150 },
  {field:"productOwnerUsername", headerName:"Owner", width: 100, },
  {field:"projectManagerUsername", headerName:"Manager", width: 100, }, 
 
];


  return (
     <div className="flex w-screen p-10 flex-col">
      <Header name="Teams" />
      <div className='flex justify-center '>
        <div  className='flex h-[650px] md:w-150 '>
          <DataGrid 
            rows={teams || []}
            columns={columns}
            pagination
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          /> 
        </div>
      </div>
    </div>
  )
}

export default Users