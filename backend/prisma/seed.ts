import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  "project.manage",
  "test_suite.manage",
  "test_case.manage",
  "test_case.review",
  "test_run.manage",
  "test_execution.record",
  "defect.manage",
  "defect.triage",
  "report.view",
  "user.manage",
];

const ROLES: Record<string, string[]> = {
  Admin: PERMISSIONS,
  "QA Lead": [
    "project.manage",
    "test_suite.manage",
    "test_case.manage",
    "test_case.review",
    "test_run.manage",
    "test_execution.record",
    "defect.manage",
    "defect.triage",
    "report.view",
  ],
  "QA Engineer": ["test_suite.manage", "test_case.manage", "test_run.manage", "test_execution.record", "defect.manage", "report.view"],
  Developer: ["defect.triage", "report.view"],
  Viewer: ["report.view"],
};

async function main() {
  console.log("Seeding roles & permissions...");

  const permissionRecords = await Promise.all(
    PERMISSIONS.map((name) =>
      prisma.permission.upsert({ where: { name }, create: { name }, update: {} })
    )
  );
  const permissionByName = Object.fromEntries(permissionRecords.map((p) => [p.name, p]));

  for (const [roleName, permNames] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      create: { name: roleName },
      update: {},
    });
    for (const permName of permNames) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permissionByName[permName].id } },
        create: { roleId: role.id, permissionId: permissionByName[permName].id },
        update: {},
      });
    }
  }

  console.log("Seeding demo admin user...");
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "Admin" } });
  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@testhub.dev" },
    create: {
      name: "Steve (Admin)",
      email: "admin@testhub.dev",
      password: passwordHash,
      roleId: adminRole.id,
    },
    update: {},
  });

  console.log("Seeding demo project, suite, and test cases...");
  const project = await prisma.project.upsert({
    where: { key: "OAX" },
    create: {
      name: "OAxis 365+ Price Mapping",
      key: "OAX",
      description: "QA coverage for the Price Mapping enhancement across Quota/Normal/Trade Promotion and Order Flow.",
      status: "ACTIVE",
      ownerId: admin.id,
      members: { create: { userId: admin.id, projectRole: "QA Lead" } },
    },
    update: {},
  });

  const suite = await prisma.testSuite.upsert({
    where: { id: "seed-suite-price-mapping" },
    create: {
      id: "seed-suite-price-mapping",
      projectId: project.id,
      name: "Price Mapping",
      description: "Channel Type + Location Scope key changes.",
    },
    update: {},
  });

  const existingCase = await prisma.testCase.findFirst({ where: { suiteId: suite.id } });
  if (!existingCase) {
    await prisma.testCase.create({
      data: {
        suiteId: suite.id,
        requirementId: "FR-013",
        title: "Apply global price mapping when no scoped mapping matches",
        priority: "HIGH",
        type: "FUNCTIONAL",
        status: "READY",
        createdById: admin.id,
        preconditions: "A global (non-scoped) price mapping exists for the Channel Type; no scoped mapping matches the customer's Location.",
        steps: {
          create: [
            { stepNumber: 1, action: "Create a global price mapping for Channel Type 'Wholesales'.", expectedResult: "Mapping saves successfully." },
            { stepNumber: 2, action: "Place an order for a customer with Channel Type 'Wholesales' outside any scoped mapping.", expectedResult: "Order pricing uses the global mapping's price group." },
          ],
        },
        history: { create: { changedById: admin.id, changeType: "CREATED" } },
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login with: admin@testhub.dev / Admin@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
