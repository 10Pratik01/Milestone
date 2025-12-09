// prisma/seed.ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma.js";

type JsonObj = Record<string, any>;

const seedDir = path.join(process.cwd(), "prisma", "seedData");

// Order chosen to respect FK constraints and handle circular refs:
// 1. projects (no refs to users/teams)
// 2. teams (omit owner fields that reference users)
// 3. users (may reference teamId -> team must exist)
// 4. update teams to set owner fields (productOwnerUserId/productManagerUserId)
// 5. projectTeam (needs project + team)
// 6. tasks (need project + author user)
// 7. attachments/comments/taskAssignment (depend on tasks/users)

const orderedFileNames = [
  "project.json",
  "team.json",
  "user.json",
  // after users are present we'll update teams owners
  "projectTeam.json",
  "task.json",
  "attachment.json",
  "comment.json",
  "taskAssignment.json",
];

function readJson(fileName: string): JsonObj[] {
  const p = path.join(seedDir, fileName);
  if (!fs.existsSync(p)) {
    console.warn(`Seed file not found: ${p}`);
    return [];
  }
  const raw = fs.readFileSync(p, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON in ${p}`, e);
    return [];
  }
}

async function safeCreateMany(delegate: any, data: any[]) {
  if (!data || data.length === 0) return;
  if (typeof delegate.createMany === "function") {
    try {
      await delegate.createMany({ data, skipDuplicates: true } as any);
      return;
    } catch (err) {
      // fall through to per-row creates
      console.warn("createMany failed, falling back to single creates:", err);
    }
  }
  let inserted = 0;
  for (const d of data) {
    try {
      await delegate.create({ data: d });
      inserted++;
    } catch (e: any) {
      console.warn("Row create failed, skipping:", e.message ?? e);
    }
  }
  console.log(`Inserted ${inserted}/${data.length} rows via create loop.`);
}

async function main() {
  console.log("Using seed directory:", seedDir);

  // 1) Projects
  const projects = readJson("project.json");
  if (projects.length) {
    console.log("Seeding projects...");
    await safeCreateMany((prisma as any).project, projects);
  }

  // 2) Teams — but remove owner fields that reference users (we'll set them later)
  const rawTeams = readJson("team.json");
  const teamsWithoutOwners = rawTeams.map((t) => {
    // fix possible typo in source: projectManagerUserId -> productManagerUserId
    if ("projectManagerUserId" in t && !("productManagerUserId" in t)) {
      t.productManagerUserId = t.projectManagerUserId;
      delete t.projectManagerUserId;
    }
    // copy without owner fields:
    const { productOwnerUserId, productManagerUserId, ...rest } = t;
    return rest;
  });
  if (teamsWithoutOwners.length) {
    console.log("Seeding teams (without owner refs)...");
    await safeCreateMany((prisma as any).team, teamsWithoutOwners);
  }

  // 3) Users (users may reference teamId so teams must exist)
  const users = readJson("user.json");
  if (users.length) {
    console.log("Seeding users...");
    await safeCreateMany((prisma as any).user, users);
  }

  // 4) Now update teams to set owner fields if present in original JSON
  if (rawTeams.length) {
    console.log("Updating teams with owner references (productOwner/productManager)...");
    for (const original of rawTeams) {
      // ensure fix for typo again
      if ("projectManagerUserId" in original && !("productManagerUserId" in original)) {
        original.productManagerUserId = original.projectManagerUserId;
        delete original.projectManagerUserId;
      }
      const teamName = original.teamName;
      if (!teamName) continue;
      try {
        // find the team created earlier by unique teamName (or by id if you have it)
        const team = await (prisma as any).team.findFirst({ where: { teamName } });
        if (!team) {
          console.warn(`Team not found to update owners: ${teamName}`);
          continue;
        }
        const updates: any = {};
        if (original.productOwnerUserId) updates.productOwnerUserId = original.productOwnerUserId;
        if (original.productManagerUserId) updates.productManagerUserId = original.productManagerUserId;
        if (Object.keys(updates).length === 0) continue;
        await (prisma as any).team.update({ where: { id: team.id }, data: updates });
        console.log(`Updated team ${teamName} with owners.`);
      } catch (e: any) {
        console.warn(`Failed to update team owners for ${teamName}:`, e.message ?? e);
      }
    }
  }

  // 5) projectTeam
  const projectTeams = readJson("projectTeam.json");
  if (projectTeams.length) {
    console.log("Seeding projectTeam...");
    await safeCreateMany((prisma as any).projectTeam, projectTeams);
  }

  // 6) tasks
  const tasks = readJson("task.json");
  if (tasks.length) {
    console.log("Seeding tasks...");
    await safeCreateMany((prisma as any).task, tasks);
  }

  // 7) attachments
  const attachments = readJson("attachment.json");
  if (attachments.length) {
    console.log("Seeding attachments...");
    await safeCreateMany((prisma as any).attachment, attachments);
  }

  // 8) comments
  const comments = readJson("comment.json");
  if (comments.length) {
    console.log("Seeding comments...");
    await safeCreateMany((prisma as any).comment, comments);
  }

  // 9) taskAssignment
  const taskAssignments = readJson("taskAssignment.json");
  if (taskAssignments.length) {
    console.log("Seeding taskAssignment...");
    await safeCreateMany((prisma as any).taskAssignment, taskAssignments);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Unhandled error in seed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });