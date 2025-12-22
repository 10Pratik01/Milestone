import { createSlice, PayloadAction } from "@reduxjs/toolkit";
//Redux toolkit setup 
export interface initialStateTypes {
    isSidebarCollapsed: boolean; 
    isDarkMode: boolean; 
    selectedProject: number; 
}

const initialState: initialStateTypes = {
    isSidebarCollapsed: false, 
    isDarkMode: false, 
    selectedProject: 1, 
}; 

export const globalSlice = createSlice({
    name:"global",
    initialState, 
    reducers: {
        setIsSidebarCollapsed: (state, action: PayloadAction<boolean> ) => {
            state.isSidebarCollapsed = action.payload; 
        }, 
        setIsDarkMode:(state, action: PayloadAction<boolean>) => {
            state.isDarkMode = action.payload; 
        },
        setSelectedProject:(state, action:PayloadAction<number>) => {
            state.selectedProject = action.payload; 
        }
    },
})

export const { setIsSidebarCollapsed,setIsDarkMode} = globalSlice.actions; 
export default globalSlice.reducer; 