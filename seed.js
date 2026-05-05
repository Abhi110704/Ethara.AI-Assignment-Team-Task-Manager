const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ethara.ai' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@ethara.ai',
      name: 'ROOT_ADMIN',
      password: hashedPassword,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@ethara.ai' },
    update: { password: hashedPassword },
    create: {
      email: 'user@ethara.ai',
      name: 'FIELD_OP_1',
      password: hashedPassword,
    },
  });

  // 2. Create Demo Project
  // We'll clean up any existing demo project to avoid duplicates if run multiple times
  await prisma.project.deleteMany({
    where: { name: 'PROJECT_NEXUS_ALPHA' }
  });

  const project = await prisma.project.create({
    data: {
      name: 'PROJECT_NEXUS_ALPHA',
      description: 'Core infrastructure migration and neural link stabilization protocols.',
      adminId: admin.id,
    }
  });

  // 3. Add Members
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: admin.id,
      role: 'ADMIN'
    }
  });

  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: user.id,
      role: 'MEMBER'
    }
  });

  // 4. Create Demo Tasks
  const tasks = [
    {
      title: 'Calibrate Quantum Sensors',
      description: 'Run diagnostic check on all external telemetry arrays before deployment.',
      status: 'DONE',
      priority: 'HIGH',
      projectId: project.id,
      assignedToId: user.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)) // Past due date to test UI
    },
    {
      title: 'Initialize Core Database Migration',
      description: 'Transfer legacy records to PostgreSQL cluster securely.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: project.id,
      assignedToId: admin.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
    },
    {
      title: 'Optimize Neural Net Latency',
      description: 'Reduce ping overhead from 40ms to <15ms on the edge nodes.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      projectId: project.id,
      assignedToId: user.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3))
    },
    {
      title: 'Deploy User Auth Middleware',
      description: 'Integrate JWT validation into all REST endpoints.',
      status: 'TODO',
      priority: 'HIGH',
      projectId: project.id,
      assignedToId: admin.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
    },
    {
      title: 'Update Ethara.OS UI Aesthetics',
      description: 'Apply scanlines and neon borders to login portal.',
      status: 'TODO',
      priority: 'LOW',
      projectId: project.id,
      assignedToId: user.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
    }
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('--- SEED SUCCESSFUL ---');
  console.log('Admin:', admin.email);
  console.log('User:', user.email);
  console.log('Project Created:', project.name);
  console.log('Tasks Generated:', tasks.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
