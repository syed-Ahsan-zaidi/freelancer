// "use server";

// import prisma from "@/lib/prisma"; // Sahi (Brackets ke baghair)
// import { revalidatePath } from "next/cache"; // ✅ Ye import zaroori hai

// export async function getClients() {
//   try {
//     return await prisma.client.findMany({
//       orderBy: { createdAt: "desc" } // ✅ Naye clients upar dikhane ke liye
//     });
//   } catch (error) {
//     console.error("Fetch Error:", error);
//     return [];
//   }
// }

// export async function createClient(data: { name: string; email: string }) {
//   try {
//     await prisma.client.create({ data });
//     revalidatePath("/clients"); // ✅ Table ko refresh karne ke liye
//     return { success: true };
//   } catch (error) {
//     console.error("Create Error:", error);
//     return { success: false };
//   }
// }

// export async function deleteClient(id: string) {
//   try {
//     await prisma.client.delete({ where: { id } });
//     revalidatePath("/clients"); // ✅ Delete ke baad table update karne ke liye
//     return { success: true };
//   } catch (error) {
//     console.error("Delete Error:", error);
//     return { success: false };
//   }
// }
"use server";

import prisma from "@/lib/prisma"; 
import { revalidatePath } from "next/cache"; 

/**
 * Saare clients fetch karne ke liye function.
 * Naye clients list mein sab se upar dikhen ge.
 */
export async function getClients() {
  try {
    return await prisma.client.findMany({
      orderBy: { createdAt: "desc" } 
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

/**
 * Naya client create karne ke liye function.
 */
export async function createClient(data: { name: string; email: string }) {
  try {
    await prisma.client.create({ data });
    
    // ✅ In dono paths ko refresh karna zaroori hai
    revalidatePath("/clients"); // Clients table update hoga
    revalidatePath("/");        // Dashboard ke stats (Happy Clients) update honge
    
    return { success: true };
  } catch (error) {
    console.error("Create Error:", error);
    return { success: false };
  }
}

/**
 * Single client with projects and invoices.
 */
export async function getClientById(id: string) {
  try {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, status: true, budget: true, image: true, createdAt: true }
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          select: { id: true, invoiceNo: true, amount: true, total: true, status: true, dueDate: true, createdAt: true }
        }
      }
    });
  } catch (error) {
    console.error("getClientById Error:", error);
    return null;
  }
}

/**
 * Client delete karne ke liye function.
 */
export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    
    // ✅ Refresh paths taake deleted client UI se foran nikal jaye
    revalidatePath("/clients"); 
    revalidatePath("/"); 
    
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false };
  }
}