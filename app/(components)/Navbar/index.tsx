'use client';

import React, { Suspense } from 'react'; 
import {Menu, Moon, Search, Sun} from 'lucide-react'
import Link from 'next/link';
import { UserButton, useAuth } from '@clerk/nextjs';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/lib/globalSlice';
import NotificationBell from '../NotificationBell';
import UserSync from '../UserSync';

const Navbar = () => {
    const dispatch = useAppDispatch(); 
    const { isSignedIn } = useAuth();
    const isSidebarCollapsed = useAppSelector(
        (state) => state.global.isSidebarCollapsed
    ) 
    const isDarkMode = useAppSelector(
        (state) => state.global.isDarkMode
    )

    return (
        <div className='flex items-center justify-between bg-white px-4 py-3 dark:bg-black dark:px-4 dark:py-3 '>
            {/* Open close */}
            {!isSidebarCollapsed ? null : (
                <button onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}>
                    <Menu className='h-8 w-8 dark:text-white'/> 
                </button>
            ) }
            
            {/* Search bar  */}
            <div className={`flex items-center gap-8`}> 
                <div className={`relative flex h-min ${!isSidebarCollapsed? "w-[200px] md:w-[250px] lg:w-[400px]" : "w-[200px] md:w-[350px] lg:w-[500px]"}`}>
                    <Search className='absolute left-4px top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white '/>
                    <input placeholder='Search.....' type="search" className='w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white ' />
                </div>
            </div> 

            {/* Icons */}
            <div className='flex items-center gap-2'>
                {/* Light mode dark mode button */}
                    <button onClick={() => dispatch(setIsDarkMode(!isDarkMode))} className={`${isDarkMode ? "h-min w-min rounded p-2 dark:hover:bg-gray-700" : `h-min w-min rounded p-2 hover:bg-gray-200`}`}>
                        {isDarkMode ? (
                            <Sun className='h-6 w-6 cursor-pointer dark:text-white' /> 
                        ) : (
                            <Moon className='h-6 w-6 cursor-pointer dark:text-white' /> 
                        )}
                    </button>
                
                {/* Notification Bell */}
                {isSignedIn && (
                    <Suspense fallback={<div className="h-6 w-6" />}>
                        <NotificationBell />
                        <UserSync />
                    </Suspense>
                )}

                <div className='ml-2 mr-5 hidden min-h-8 w-[0.1rem] bg-gray-200 md:inline-block'> </div>
                
                {/* Authentication Buttons */}
                {isSignedIn ? (
                    <UserButton afterSignOutUrl="/sign-in"/>
                ) : (
                    <div className='flex items-center gap-2'>
                        <Link 
                            href="/sign-in"
                            className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors'
                        >
                            Sign In
                        </Link>
                        <Link 
                            href="/sign-up"
                            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors'
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar; 