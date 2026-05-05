import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    if (project.adminId !== session.user.id) {
      return NextResponse.json({ message: "Only admin can add members" }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToAdd) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if already member
    const existingMember = await prisma.projectMember.findFirst({
      where: { projectId: id, userId: userToAdd.id }
    });

    if (existingMember) {
      return NextResponse.json({ message: "User is already a member" }, { status: 400 });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userToAdd.id,
        role: "MEMBER",
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
