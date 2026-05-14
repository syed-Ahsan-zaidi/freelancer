"use server";

import { prisma } from "./prisma.config";
import { revalidatePath } from "next/cache";

// Profile update logic
export async function updateProfile(data: { 
  name: string; 
  email: string; 
  bio: string;
  image?: string | null; 
}) {
  try {
    const formattedEmail = data.email.trim().toLowerCase();

    const user = await prisma.user.upsert({
      where: { 
        email: formattedEmail 
      },
      update: {
        name: data.name,
        bio: data.bio,
        image: data.image,
      },
      create: {
        email: formattedEmail,
        name: data.name,
        bio: data.bio,
        image: data.image,
        role: "CLIENT", // Default role for new users
      },
    });

    console.log("Profile Sync Successful for:", user.email);
    
    revalidatePath("/settings/profile"); 
    revalidatePath("/settings"); 
    
    return { success: true, user };
  } catch (error) {
    console.error("Critical Save Error:", error);
    return { success: false, error: "Database sync failed" };
  }
}

// ✅ Fix: inquiryNotify ko hata diya aur role add kiya
export async function getUser(email: string) {
  if (!email) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        emailNotify: true,
        desktopNotify: true,
        inquiryNotify: true,
      }
    });
    return user;
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

// ✅ Notification logic updated
export async function updateNotifications(email: string, prefs: {
  emailNotify: boolean;
  desktopNotify: boolean;
  inquiryNotify?: boolean;
}) {
  try {
    await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: {
        emailNotify: prefs.emailNotify,
        desktopNotify: prefs.desktopNotify,
        inquiryNotify: prefs.inquiryNotify,
      },
    });
    revalidatePath("/settings/notifications");
    return { success: true };
  } catch (error) {
    console.error("Notification Update Error:", error);
    return { success: false };
  }
}