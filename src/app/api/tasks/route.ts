import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. Tasks Fetch karne ke liye
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: { project: true }, // Project ki details bhi sath ayengi
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(tasks || []); 
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// 2. Naya Task Save karne ke liye (Ye zaroori hai)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, status, projectId, dueDate } = body;

    // Validation
    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and Project ID are required" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || "",
        status: status || "Todo",
        dueDate: dueDate || null,
        project: {
          connect: { id: projectId }
        }
      },
    });

    return NextResponse.json(newTask);
  } catch (error: any) {
    console.error("Task Save Error:", error);
    return NextResponse.json(
      { error: "Database error: " + error.message },
      { status: 500 }
    );
  }
}