"use client"; 
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/state';
import { useGetProjectsQuery } from '@/state/api';
import { AlertCircle, AlertOctagon, AlertTriangle, Briefcase, ChevronDown, ChevronUp, Home, Layers3, LockIcon, LucideIcon, Search, Settings, ShieldAlert, User, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react'; 

// Constants for Sidebar Navigations
const SidebarNavLinks = [ 
    { 
        icon:Home, 
        label:"Home", 
        href: "/home",
    }, 
    { 
        icon: Briefcase, 
        label:"Timeline", 
        href: "/timeline",
    }, 
    { 
        icon:Search, 
        label:"Search", 
        href: "/search",
    }, 
    { 
        icon:Settings, 
        label:"Settings", 
        href: "/settings",
    }, 
    { 
        icon:User, 
        label:"Users", 
        href: "/users",
    }, 
    { 
        icon:Users, 
        label:"Teams", 
        href: "/teams",
    }, 

    
]

const PriorityLinks = [
   { 
        icon:AlertCircle, 
        label:"Urgent", 
        href: "/priority/urgent",
    }, 
   { 
        icon:ShieldAlert, 
        label:"High", 
        href: "/priority/high",
    }, 
   { 
        icon:AlertTriangle, 
        label:"Medium", 
        href: "/priority/medium",
    }, 
   { 
        icon:AlertOctagon, 
        label:"Low", 
        href: "/priority/low",
    }, 
   { 
        icon:Layers3, 
        label:"Backlog", 
        href: "/priority/backlog",
    }, 
]

const Sidebar = () => {
    const [showProjects, setshowProjects] = useState(true); 
    const [showPriority, setShowPriority] = useState(true); 


    const {data:projects} = useGetProjectsQuery(); 
    const dispatch = useAppDispatch(); 
    const isSidebarCollapsed = useAppSelector(
        (state) => state.global.isSidebarCollapsed
    )


    const sidebarClassNames = `fixed flex   flex-col h-full justify-between shadow-xl transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white ${isSidebarCollapsed ? 'w-0 hidden' : 'w-64'}` 

    return( 
        <div className={sidebarClassNames}>
            <div className='flex h-full w-full flex-col justify-start'>

            {/* TOP logo */}
                <div className='z-50 flex min-h-14 w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black'>
                    <div className='text-xl font-bold text-gray-800 dark:text-white'>
                        Taskorium
                    </div>

                    {isSidebarCollapsed ? null : (
                        <button className='py-3' onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}>
                            <X className='h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white '/> 
                        </button>
                    )}
                </div>
            {/* Team */}
            <div className='flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700 '>
                <Image src="/logo.png" alt="LOGO" width={40} height={40} /> 
                <div>
                    <h3 className='text-md font-bold tracking-wide dark:text-gray-200'>Taskorium</h3>
                    <div className='mt-1 flex items-start gap-2'>
                    <LockIcon className='mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400'/>
                    <p className='text-xs text-gray-500'>Private</p>
                    </div>
                </div>
            </div>
            {/* Navbar links */}
                <nav className='z-10 w-full'>

                    {SidebarNavLinks.map((props) => (
                        <li key={props.href} className='list-none'>
                            <SidebarLink href={props.href} icon={props.icon} label={props.label}/>
                        </li>
                    
                    ))}
                    
                </nav>

            {/* Project Links */}
                <button onClick={() => setshowProjects((prev) => !prev)} className={`flex w-full items-center justify-between px-8 py-3 text-gray-500 `}>
                    <span className=''>Projects</span>
                    {showProjects ? (
                        <ChevronUp className={`h-5 w-5 `}/>
                    ) : 
                    (
                        <ChevronDown className={`h-5 w-5 `}/>
                    )}
                </button>

            
            {/* Projects list */}
            {showProjects && projects?.map((project) => (
                <SidebarLink 
                    key={project.id}
                    icon={Briefcase}
                    label={project.name}
                    href ={`/projects/${project.id}`}
                />
            ))}

            {/* Priorities links */}
                <button onClick={() => setShowPriority((prev) => !prev)} className={`flex w-full items-center justify-between px-8 py-3 text-gray-500 `}>
                    <span className=''>Priority</span>
                    {showPriority ? (
                        <ChevronUp className={`h-5 w-5 `}/>
                    ) : 
                    (
                        <ChevronDown className={`h-5 w-5 `}/>
                    )}
                </button>
                {showPriority && (
                    <> 
                        {PriorityLinks.map((props) => (
                            <li key={props.href} className='list-none'>
                            <SidebarLink href={props.href} icon={props.icon} label={props.label}/>
                        </li>
                        ))}
                    </>
                )}
            </div>            
        </div>
    )
}

interface SidebarLinkProps{
    href: string;  
    icon : LucideIcon;
    label: string; 

}


const SidebarLink = ({
    href, 
    icon: Icon, 
    label, 


} : SidebarLinkProps) => {
    const pathname = usePathname(); 

    const isActive = pathname === href || (pathname === "/" && href === '/dashboard'); 


    const [blueBar, setBlueBar] = useState(false)
    return(
        <Link href={href} className='2-full'>
            <div className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700  ${isActive ? "bg-gray-100 text-white dark:bg-gray-600" : ""} justify-start px-8 py-3`} onMouseEnter={() => setBlueBar(!blueBar)} onMouseLeave={() => setBlueBar(!blueBar)}>
                
                {isActive && (
                    <div className={`absolute  top-0 left-0 h-full bg-blue-500 ${blueBar ? 'w-2.5 transition-all ease-linear transition-150ms' : "w-[5px]"}`} />
                )}
                
                <Icon className='h-6 w-6 text-gray-800 dark:text-gray-100' /> 

                <span className={`font-medium text-gray-800 dark:text-gray-100`}>{label}</span>
                
                
            
            </div>
        </Link>
    )
}
export default Sidebar; 