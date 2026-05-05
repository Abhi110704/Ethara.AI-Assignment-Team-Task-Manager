import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { adminId: userId },
          { members: { some: { userId } } },
        ]
      },
      select: { id: true }
    });

    const projectIds = userProjects.map(p => p.id);

    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } }
    });

    const totalTasks = tasks.length;
    const tasksByStatus = {
      TODO: tasks.filter(t => t.status === "TODO").length,
      IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS").length,
      DONE: tasks.filter(t => t.status === "DONE").length,
    };

    const tasksPerUser = tasks.reduce((acc: Record<string, number>, task) => {
      if (task.assignedToId) {
        acc[task.assignedToId] = (acc[task.assignedToId] || 0) + 1;
      }
      return acc;
    }, {});

    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE").length;
    
    // Get user names for tasksPerUser mapping
    const userIds = Object.keys(tasksPerUser);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true }
    });
    
    const tasksPerUserName = users.reduce((acc: Record<string, number>, user) => {
      acc[user.name] = tasksPerUser[user.id];
      return acc;
    }, {});

    return NextResponse.json({
      totalTasks,
      tasksByStatus,
      tasksPerUser: tasksPerUserName,
      overdueTasks
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
