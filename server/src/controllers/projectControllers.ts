import type { Request, Response } from "express";
import {prisma} from "../lib/prisma.js"

export const getProjects = async (
    req:Request, 
    res:Response
):Promise<void> => {
    try {
        const projects = await prisma.project.findMany(); 
        console.log(projects)
        res.json(projects)
    } catch (error) {
        res.status(500).json({message:"Error retrieving process"})
    }
}

