"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// 1. PROJECTS FETCH KARNE KA FUNCTION
export async function getProjects() {
    try {
        const projects = await prisma.project.findMany({ 
            include: {
                client: true, 
            },
            orderBy: { createdAt: 'desc' },
            take: 100 
        });
        return { success: true, projects };
    } catch (e: any) { 
        console.error("Fetch Error:", e);
        return { success: false, projects: [] }; 
    }
}

// 2. PROJECT CREATE KARNE KA FUNCTION (Fixed & Merged)
export async function createProject(formData: any) {
    try {
        // User find karna zaroori hai userId field ke liye
        const user = await prisma.user.findFirst();
        
        // Fallback Client ID logic
        let targetClientId = formData.clientId;
        if (!targetClientId || targetClientId === "") {
            const defaultClient = await prisma.client.findFirst();
            targetClientId = defaultClient?.id || "";
        }
        
        if(!user || !targetClientId) {
            throw new Error("User ya Client database mein nahi mila.");
        }

        const newProject = await prisma.project.create({
            data: {
                title: formData.title,
                category: formData.category,
                image: formData.image || null,
                status: formData.status || "draft",
                budget: parseFloat(formData.budget.toString()), 
                userId: user.id,
                clientId: targetClientId, 
            }
        });

        // Sab pages ka data refresh karein
        revalidatePath("/dashboard");
        revalidatePath("/projects"); 
        revalidatePath("/clients");
        
        return { success: true, data: newProject };
    } catch (e: any) { 
        console.error("Create Error:", e.message);
        return { success: false, error: e.message }; 
    }
}

// 3. PROJECT DELETE KARNE KA FUNCTION
export async function deleteProject(id: string) {
    try {
        await prisma.project.delete({ 
            where: { id } 
        });
        
        revalidatePath("/dashboard");
        revalidatePath("/projects");
        
        return { success: true };
    } catch (e: any) { 
        console.error("Delete Error:", e);
        return { success: false }; 
    }
}