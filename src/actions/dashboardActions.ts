"use server";

import { prisma } from "./prisma.config";
import { revalidatePath } from "next/cache";

// 1. Naya Task Create karne ka function
export async function createNewTask(data: any) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title || "Untitled Task",
        description: data.description || data.title || "",
        status: data.status || "Todo",
        price: data.price ? Number(data.price) : null,
        projectId: data.projectId || null,
      },
    });

    // Notification create karo
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.notification.create({
        data: {
          message: `New task "${task.title}" added`,
          type: "TASK",
          userId: user.id,
          isRead: false,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    return { success: true, task };
  } catch (error: any) {
    console.error("Create Task Error:", error);
    return { success: false, error: error.message };
  }
}

// 2. Task Status Update + Auto Invoice jab DONE ho
export async function updateTaskStatus(id: string, status: string) {
  try {
    const task = await prisma.task.update({
      where: { id: id },
      data: { status },
      include: {
        project: {
          include: { client: true }
        }
      }
    });

    // Jab task DONE ho → auto PAID invoice banao
    if (status === "DONE") {
      // Amount: task.price > 0 ho, ya project ka budget use karo
      const amount = (task.price && task.price > 0)
        ? task.price
        : (task.project?.budget && task.project.budget > 0 ? task.project.budget : 0);

      // Client: project ka client, ya koi bhi pehla client
      let clientId = task.project?.client?.id || null;
      if (!clientId) {
        const anyClient = await prisma.client.findFirst();
        clientId = anyClient?.id || null;
      }

      if (amount > 0 && clientId) {
        const invoiceNo = `INV-${Date.now()}`;
        const tax = amount * 0.1;
        const total = amount + tax;

        await prisma.invoice.create({
          data: {
            invoiceNo,
            clientId,
            projectId: task.projectId || undefined,
            amount,
            tax,
            total,
            dueDate: new Date(),
            status: "PAID",
          },
        });

        const user = await prisma.user.findFirst();
        if (user) {
          await prisma.notification.create({
            data: {
              message: `Task "${task.title}" complete — Invoice ${invoiceNo} auto-paid ($${amount})`,
              type: "INVOICE",
              userId: user.id,
              isRead: false,
            },
          });
        }

        revalidatePath("/tasks");
        revalidatePath("/invoices");
        revalidatePath("/dashboard");
        return { success: true, autoInvoice: true };
      }
    }

    revalidatePath("/tasks");
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { success: true, autoInvoice: false };
  } catch (error: any) {
    console.error("Update Status Error:", error);
    return { success: false };
  }
}

// 3. Task Delete karne ka function
export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id: id },
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: error.message };
  }
}

// 4. Dashboard aur Tasks page ka data fetch karne ka function
export async function getDashboardData() {
  try {
    const [tasks, projects, clients] = await Promise.all([
      prisma.task.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, status: true, createdAt: true,
          project: { select: { id: true, title: true } }
        }
      }),
      prisma.project.findMany({
        take: 20,
        orderBy: { id: 'desc' },
        select: {
          id: true, title: true, status: true, budget: true, image: true,
          description: true,
          client: { select: { id: true, name: true } }
        }
      }),
      prisma.client.findMany({
        take: 50,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true }
      })
    ]);
    return { tasks, projects, clients };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { tasks: [], projects: [], clients: [] };
  }
}

// 5. Dashboard ke liye sab kuch ek hi call mein (Stats + Data + Notifications)
export async function getAllDashboardData() {
  try {
    const [tasks, projects, clients, invoices, notifications] = await Promise.all([
      prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, status: true }
      }),
      prisma.project.findMany({
        take: 20,
        orderBy: { id: 'desc' },
        select: {
          id: true, title: true, status: true, budget: true, image: true,
          client: { select: { name: true } }
        }
      }),
      prisma.client.findMany({
        take: 50,
        select: { id: true, name: true }
      }),
      prisma.invoice.findMany({
        take: 50,
        select: { id: true, amount: true, status: true }
      }),
      prisma.notification.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: { id: true, message: true, type: true, isRead: true, createdAt: true }
      })
    ]);

    const totalRevenue = invoices
      .filter(inv => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.amount, 0);

    return {
      tasks,
      projects,
      clients,
      notifications,
      stats: {
        totalRevenue,
        activeProjects: projects.length,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.status === "PAID").length,
      }
    };
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return {
      tasks: [], projects: [], clients: [], notifications: [],
      stats: { totalRevenue: 0, activeProjects: 0, totalInvoices: 0, paidInvoices: 0 }
    };
  }
}