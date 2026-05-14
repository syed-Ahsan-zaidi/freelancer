"use server";

import { prisma } from "./prisma.config";
import { revalidatePath } from "next/cache";

export async function getResearchByProject(projectId: string) {
  try {
    const data = await prisma.researchData.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createResearch(data: {
  projectId: string;
  title: string;
  content: string;
  fileUrl?: string;
  tags?: string[];
}) {
  try {
    const research = await prisma.researchData.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        content: data.content,
        fileUrl: data.fileUrl || null,
        tags: data.tags || [],
      },
    });
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true, research };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteResearch(id: string, projectId: string) {
  try {
    await prisma.researchData.delete({ where: { id } });
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
