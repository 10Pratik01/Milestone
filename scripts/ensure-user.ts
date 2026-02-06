import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;

console.log("Loaded Connection String:", connectionString ? "Present" : "Missing");
if (connectionString) {
    console.log("Length:", connectionString.length);
    // Mask password
    console.log("URL:", connectionString.replace(/:[^:@]*@/, ":****@"));
}

const pool = new Pool({ 
    connectionString,
    ssl: true, // Force SSL for Neon
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clerk ID from the user's logs
  const clerkId = "user_39FKLXrrvWHPJcPANnKyvmKa5ZB";
  
  console.log(`Checking for user: ${clerkId}`);

  // Test pool connection first
  try {
      const client = await pool.connect();
      console.log("✅ Pool connected successfully");
      client.release();
  } catch (e) {
      console.error("❌ Pool connection failed:", e);
      return;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (user) {
    console.log("✅ User already exists:", user);
  } else {
    console.log("❌ User not found. Creating...");
    
    // Create a dummy user for dev purposes
    // In production, webhooks would handle this with real data
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        username: "dev_user",
        email: "dev@example.com", 
        profilePictureUrl: null,
      },
    });
    
    console.log("✅ User created successfully:", newUser);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
