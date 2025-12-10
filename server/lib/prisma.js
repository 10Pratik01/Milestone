// lib/prisma.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// Build adapter from DATABASE_URL (make sure .env has DATABASE_URL)
if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable. Add it to your .env or provide it another way.");
}
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // optional pool options:
    // min: 0, max: 10
});
const createClient = () => new PrismaClient({ adapter });
export const prisma = global.prisma ??
    createClient();
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
//# sourceMappingURL=prisma.js.map