import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import nodemailer from "nodemailer";
import { prisma } from "@/actions/prisma.config";

async function sendLoginEmails(userName: string, userEmail: string, provider: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const loginTime = new Date().toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      dateStyle: "full",
      timeStyle: "short",
    });

    const adminEmail = transporter.sendMail({
      from: `"Freelance Tracker" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || "ahsanzaidi51272@gmail.com",
      subject: `New Login Alert — ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #2563eb; padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Freelance Tracker</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Admin Login Alert</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 18px;">Someone logged in to Freelance Tracker</h2>
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 13px;"><strong style="color: #0f172a;">Name:</strong> ${userName}</p>
              <p style="margin: 0 0 10px; color: #64748b; font-size: 13px;"><strong style="color: #0f172a;">Email:</strong> ${userEmail}</p>
              <p style="margin: 0 0 10px; color: #64748b; font-size: 13px;"><strong style="color: #0f172a;">Provider:</strong> ${provider}</p>
              <p style="margin: 0; color: #64748b; font-size: 13px;"><strong style="color: #0f172a;">Time:</strong> ${loginTime}</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">If this was not you, please secure your account immediately.</p>
          </div>
        </div>
      `,
    });

    const userEmailNotif = transporter.sendMail({
      from: `"Freelance Tracker" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Welcome back, ${userName}! You just logged in`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #2563eb; padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Freelance Tracker</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Login Successful</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0f172a; margin: 0 0 8px; font-size: 22px;">Welcome back, ${userName}! 👋</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">You have successfully logged in to Freelance Tracker.</p>
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 13px;"><strong style="color: #0f172a;">Login via:</strong> ${provider}</p>
              <p style="margin: 0; color: #64748b; font-size: 13px;"><strong style="color: #0f172a;">Time:</strong> ${loginTime}</p>
            </div>
            <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 14px;">
              <p style="color: #92400e; font-size: 12px; margin: 0;">⚠️ If you did not login, please change your password immediately.</p>
            </div>
          </div>
          <div style="padding: 16px 32px; background: #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Freelance Tracker — Secure Dashboard</p>
          </div>
        </div>
      `,
    });

    await Promise.all([adminEmail, userEmailNotif]);
  } catch (error) {
    console.error("Login email error:", error);
  }
}

async function autoAddClient(userName: string, userEmail: string, userImage: string | null) {
  try {
    // Pehle check karo koi client already hai is email se
    const existingClient = await prisma.client.findUnique({
      where: { email: userEmail },
    });

    if (!existingClient) {
      // Naya client automatically add karo
      await prisma.client.create({
        data: {
          name: userName,
          email: userEmail,
        },
      });

      // Admin ko notification do ke naya client add hua
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
      const anyUser = adminUser || await prisma.user.findFirst();
      if (anyUser) {
        await prisma.notification.create({
          data: {
            message: `New client registered: ${userName} (${userEmail})`,
            type: "PROJECT",
            userId: anyUser.id,
            isRead: false,
          },
        });
      }
    }
  } catch (error) {
    console.error("Auto-add client error:", error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      const provider = account?.provider === "github" ? "GitHub" : "Google";
      const userName = user.name || "Unknown User";
      const userEmail = user.email || "";

      // Email notifications bhejo
      await sendLoginEmails(userName, userEmail, provider);

      // Automatically client list mein add karo
      if (userEmail) {
        await autoAddClient(userName, userEmail, user.image || null);
      }

      return true;
    },
  },
};
