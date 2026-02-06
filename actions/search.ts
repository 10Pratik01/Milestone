"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";

export async function search(query: string) {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
        throw new Error("Unauthorized");
    }

    const tasks = await prisma.task.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ]
        }
    })

    const projects = await prisma.project.findMany({
        where: {
            OR: [
                 { name: { contains: query, mode: "insensitive" } },
                 { description: { contains: query, mode: "insensitive" } },
            ]
        }
    })

    const users = await prisma.user.findMany({
         where: {
            OR: [
                 { username: { contains: query, mode: "insensitive" } },
            ]
        }
    })

    return { tasks, projects, users };
}
