"use server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";

export async function getTeams() {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
        throw new Error("Unauthorized");
    }

    const teams = await prisma.team.findMany({
        include: {
            projectTeams: true, 
            users: true
        }
    });

    return teams;
}
