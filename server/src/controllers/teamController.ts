import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

export const getTeams = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const teams = await prisma.team.findMany();

    const result = (
      await Promise.all(
        teams.map(async (team) => {
          const response: Record<string, any> = {};

          // Fetch Product Owner username
          if (team.productOwnerUserId) {
            const owner = await prisma.user.findUnique({
              where: { userId: team.productOwnerUserId },
              select: { username: true },
            });

            if (owner?.username) {
              response.productOwnerUsername = owner.username;
            }
          }

          // Fetch Project Manager username
          if (team.productManagerUserId) {
            const manager = await prisma.user.findUnique({
              where: { userId: team.productManagerUserId },
              select: { username: true },
            });

            if (manager?.username) {
              response.projectManagerUsername = manager.username;
            }
          }

          // ✅ Send team.id ONLY if at least one username exists
          if (Object.keys(response).length > 0) {
            response.id = team.id;
            response.teamName = team.teamName; 
            return response;
          }

          // ❌ Drop empty teams completely
          return null;
        })
      )
    ).filter(Boolean);

    res.json(result);
  } catch (error: any) {
    console.error("Error retrieving teams:", error);
    res.status(500).json({
      message: `Error retrieving teams: ${error.message}`,
    });
  }
};
