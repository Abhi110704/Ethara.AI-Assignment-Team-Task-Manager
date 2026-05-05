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

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { adminId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
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

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        adminId: session.user.id,
      },
    });

    // Add admin as a member as well for consistency
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        role: "ADMIN",
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
