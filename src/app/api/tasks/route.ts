import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const whereClause: any = {
      project: {
        members: { some: { userId: session.user.id } }
      }
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, dueDate, priority, projectId, assignedToId } = await req.json();

    if (!title || !priority || !projectId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if user is member of project
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: session.user.id }
    });

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!member && project?.adminId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status: "TODO",
        projectId,
        assignedToId: assignedToId || null,
      },
      include: {
        assignedTo: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
