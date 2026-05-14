"use client";
import { usePathname } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
import AIChatbot from "@/components/AIChatbot";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">Syncing Freelance Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {!isLoginPage && <Sidebar theme="light" />}
      
      {/* Main Content Area: Margin aur Width fix ki gayi hai */}
      <main className={`flex-1 transition-all duration-300 min-h-screen ${
        !isLoginPage ? "md:ml-64" : "w-full"
      }`}>
        <div className="w-full p-0">
          {children}
        </div>
      </main>

      {!isLoginPage && <AIChatbot />}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
        <SessionProvider>
          <AuthGuard>{children}</AuthGuard>
        </SessionProvider>
      </body>
    </html>
  );
}