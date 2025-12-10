import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
export const getProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany();
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving process" });
    }
};
