import type { Request, Response } from "express";
import {prisma} from '../lib/prisma.js'

export const getTask = async (req: Request, res:Response): Promise<void> => {
    const {projectId} = req.query; 
    try {
        const tasks = await prisma.task.findMany({
            where: {
                projectId : Number(projectId), 
            }, 
            include:{
                author: true, 
                assignee: true, 
                comments: true, 
                attachments: true, 
            }
        }); 
        res.status(201).json({tasks, message:"Fetched succesfully"})
    } catch (error:any) {
            res.status(500).json({
                message:`Error: ${error.message} , Please try again `
            })
    }
}


export const createTask = async (req: Request, res:Response):Promise<void> =>{
    const {title, description, status, priority, tags, startDate, dueDate, points, projectId, authorUserId, assignedUserId} = req.body;
    
    try {
        const newTask = prisma.task.create({
            data:{
                title, 
                description, 
                status, 
                priority, 
                tags,
                startDate,
                dueDate,
                points,
                projectId,
                authorUserId, 
                assignedUserId
            }
        }) 
        
        res.status(201).json({newTask, message:`created ${(await newTask).title} successfuly`})

    } catch (error:any) {
        res.status(501).json({messge:`Server failed to create a task please try again later ${error.messgae}`})
    }
} 

export const updateTaskStatus = async (req:Request, res:Response): Promise<void> => {
    const{taskId} = req.params; 
    const {status} = req.body;  
    try {
        const updatedTask = await prisma.task.update({
            where:{
                id: Number(taskId), 
            }, 
            data:{
                status : status,
            }
        })
        res.status(201).json({updatedTask, message:"Status is updated"})
    } catch (error:any ) {
        res.status(501).json({messge:`Server failed to update a task please try again later ${error.messgae}`})
    }
} 