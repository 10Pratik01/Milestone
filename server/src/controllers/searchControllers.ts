import type {Request, Response} from 'express';
import {prisma} from '../lib/prisma.js'

export const search = async (req : Request, res: Response): Promise<void> => {
    const query = req.query.query;

    if (!query || typeof query !== "string") {
    res.status(400).json({ message: "Query parameter is required" });
    return;
    }


    try {

        const tasks = await prisma.task.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } }
                ]
            }
        })
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                   { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } }
                ]
            }
        })

        const users = await prisma.user.findMany({
            where: {
            username: { contains: query, mode: "insensitive" }
        }
        })

        res.status(201).json({projects, users, tasks})
    } catch (error) {
        res.status(500).json({error, message:"failed to load items"}); 
    }
}