import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedError } from "@/lib/api-response";
import { createProjectSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

console.log("🟣 [MODULE] /api/projects/route.ts loaded at", new Date().toISOString());

/**
 * GET /api/projects
 * Get all projects
 */
export async function GET() {
  console.log("🔵 [API] GET /api/projects - Request received");
  
  try {
    console.log("🔵 [API] Checking authentication...");
    const { userId: clerkId } = await auth();
    console.log("🔵 [API] Clerk ID:", clerkId);
    
    if (!clerkId) {
      console.log("🔴 [API] No clerk ID - returning unauthorized");
      return unauthorizedError();
    }

    console.log("🔵 [API] Fetching projects from database...");
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        projectTeams: {
          include: {
            team: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`🟢 [API] Found ${projects.length} projects`);
    console.log("🟢 [API] Returning success response");
    return successResponse(projects);
  } catch (error) {
    console.error("🔴 [API] Error fetching projects:", error);
    return errorResponse("Failed to fetch projects");
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: Request) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔵 [API] POST /api/projects - Request received");
  console.log("🔵 [API] Request URL:", request.url);
  console.log("🔵 [API] Request method:", request.method);
  console.log("🔵 [API] Request headers:", Object.fromEntries(request.headers.entries()));
  console.log("🔵 [API] Timestamp:", new Date().toISOString());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  try {
    console.log("🔵 [API] Step 1: Checking authentication...");
    const { userId: clerkId } = await auth();
    console.log("🔵 [API] Clerk ID:", clerkId);
    console.log("🔵 [API] Clerk ID type:", typeof clerkId);
    console.log("🔵 [API] Is authenticated:", !!clerkId);
    
    if (!clerkId) {
      console.log("🔴 [API] No clerk ID - returning unauthorized");
      const response = unauthorizedError();
      console.log("🔴 [API] Unauthorized response:", response);
      return response;
    }

    console.log("🔵 [API] Step 2: Looking up user in database...");
    console.log("🔵 [API] Searching for user with clerkId:", clerkId);
    
    // Get user from database
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    console.log("🔵 [API] User query result:", user ? `Found: ${user.username}` : "Not found");
    
    // If user doesn't exist, create them automatically
    if (!user) {
      console.log("🟡 [API] User not found in database for clerkId:", clerkId);
      console.log("🟡 [API] Auto-creating user from Clerk data...");
      
      try {
        // Get full user data from Clerk
        const { currentUser } = await import("@clerk/nextjs/server");
        const clerkUser = await currentUser();
        
        if (!clerkUser) {
          console.log("🔴 [API] Could not fetch user from Clerk");
          const response = errorResponse("Could not fetch user data", 500);
          return response;
        }

        console.log("🔵 [API] Clerk user data:", {
          id: clerkUser.id,
          username: clerkUser.username,
          email: clerkUser.emailAddresses[0]?.emailAddress,
        });

        // Create user in database
        user = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            profilePictureUrl: clerkUser.imageUrl || null,
          },
        });

        console.log("🟢 [API] User auto-created successfully:", user.username, "(ID:", user.userId, ")");
      } catch (createError) {
        console.error("🔴 [API] Failed to auto-create user:", createError);
        const response = errorResponse("Failed to create user in database", 500);
        console.log("🔴 [API] Error response:", response);
        return response;
      }
    }

    console.log("🔵 [API] Step 3: User found -", user.username, "(ID:", user.userId, ")");
    console.log("🔵 [API] Step 4: Parsing request body...");
    
    const bodyText = await request.text();
    console.log("🔵 [API] Raw body text:", bodyText);
    console.log("🔵 [API] Body length:", bodyText.length);
    
    let body;
    try {
      body = JSON.parse(bodyText);
      console.log("🔵 [API] Parsed body:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("🔴 [API] Failed to parse JSON:", parseError);
      return errorResponse("Invalid JSON in request body", 400);
    }

    console.log("🔵 [API] Step 5: Validating input...");
    console.log("🔵 [API] Validation schema:", createProjectSchema);
    
    // Validate input
    const validation = createProjectSchema.safeParse(body);
    
    if (!validation.success) {
      console.log("🔴 [API] Validation failed!");
      console.log("🔴 [API] Validation errors:", JSON.stringify(validation.error.issues, null, 2));
      const response = errorResponse(
        validation.error.issues[0].message,
        400,
        "VALIDATION_ERROR"
      );
      console.log("🔴 [API] Returning validation error response");
      return response;
    }

    console.log("🟢 [API] Validation passed!");
    const { name, description, startDate, endDate, status } = validation.data;
    console.log("🔵 [API] Step 6: Creating project with data:");
    console.log("🔵 [API]   - Name:", name);
    console.log("🔵 [API]   - Description:", description);
    console.log("🔵 [API]   - Start Date:", startDate);
    console.log("🔵 [API]   - End Date:", endDate);
    console.log("🔵 [API]   - Status:", status || "active");

    console.log("🔵 [API] Step 7: Executing database insert...");
    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "active",
      },
    });

    console.log("🟢 [API] Project created successfully!");
    console.log("🟢 [API] Project ID:", project.id);
    console.log("� [API] Project data:", JSON.stringify(project, null, 2));
    
    console.log("�🔵 [API] Step 8: Logging activity...");

    // Log activity
    await logActivity({
      userId: user.userId,
      action: "created_project",
      entityType: "project",
      entityId: project.id,
      projectId: project.id,
      metadata: { projectName: project.name },
    });

    console.log("🟢 [API] Activity logged successfully");
    console.log("🔵 [API] Step 9: Creating success response...");
    
    const response = successResponse(project, 201);
    console.log("🟢 [API] Success response created");
    console.log("🟢 [API] Response status:", 201);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🟢 [API] POST /api/projects - COMPLETED SUCCESSFULLY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return response;
  } catch (error) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("🔴 [API] EXCEPTION CAUGHT in POST /api/projects");
    console.error("🔴 [API] Error type:", error?.constructor?.name);
    console.error("🔴 [API] Error message:", error instanceof Error ? error.message : String(error));
    console.error("🔴 [API] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("🔴 [API] Full error object:", error);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return errorResponse("Failed to create project");
  }
}
