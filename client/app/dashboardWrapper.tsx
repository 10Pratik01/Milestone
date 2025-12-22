"use client"; 

import React, { useEffect } from 'react'; 
import Navbar from './(components)/Navbar';
import Sidebar from './(components)/Sidebar';
import StoreProvider, { useAppSelector } from './redux';

const DashboardLayout = ({children} : {children: React.ReactNode} ) => {
    const isSidebarCollapsed = useAppSelector((state)=> state.global.isSidebarCollapsed); 
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode); 
    
    
    useEffect(() => {
        const htmlElement = document.documentElement;
        if (isDarkMode) {
            htmlElement.classList.add("dark");
        } else {
            htmlElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    return(
        <div className='flex min-h-screen w-full bg-gray-50 text-gray-900 dark:bg-dark-bg dark:text-white'>
            <Sidebar/>
            <main className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${isSidebarCollapsed ? "" : "md:pl-64"}`}>
                <Navbar/>
                {children}
            </main>
        </div>
    )
}

const DashboardWrapper = ({children}: {children: React.ReactNode}) => {
    return(
        <StoreProvider>
            <DashboardLayout>{children}</DashboardLayout>
        </StoreProvider>
    )
}

export default DashboardWrapper;