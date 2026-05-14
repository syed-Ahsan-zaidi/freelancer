"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Briefcase, Users, CheckSquare, Zap, Settings, FileText, Menu, X } from "lucide-react";
import { getUser } from "@/actions/user";

export default function Sidebar({ theme = "dark" }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const [userData, setUserData] = useState({
    name: "Ayesha Khalid",
    email: "ayeshaqq36@gmail.com",
    image: null as string | null
  });

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function loadUserData() {
      try {
        const dbUser = await getUser(userData.email);
        if (dbUser) {
          setUserData({
            name: dbUser.name || "Ayesha Khalid",
            email: dbUser.email,
            image: dbUser.image || null,
          });
        }
      } catch (error) {
        console.error("Sidebar data fetch error:", error);
      }
    }
    loadUserData();
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
    { name: "Projects", icon: Briefcase, href: "/projects" },
    { name: "Clients", icon: Users, href: "/clients" },
    { name: "Tasks", icon: CheckSquare, href: "/tasks" },
    { name: "Invoices", icon: FileText, href: "/invoices" },
  ];

  // --- PROFESSIONAL THEME COLORS ---
  const sidebarStyles = {
    // Jet Black ki jagah Zinc-950 use kiya hai (Professional Standard)
    dark: "bg-zinc-950 border-zinc-800 text-zinc-400 shadow-none", 
    light: "bg-white border-slate-200 text-slate-600 shadow-sm",
    cyber: "bg-[#050505] border-[#00ffc3]/10 text-[#00ffc3]/70"
  };

  const current = sidebarStyles[theme as keyof typeof sidebarStyles] || sidebarStyles.dark;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-5 left-5 z-[10000] p-2 rounded-lg lg:hidden border transition-all ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
        }`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-64 z-[9999] flex flex-col py-8 border-r transition-all duration-300
        ${current}
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
      `}>
        
        {/* LOGO SECTION - Cleaner Typography */}
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <h1 className={`font-semibold text-lg tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-zinc-100'}`}>
            Freelancer
          </h1>
        </div>

        {/* NAVIGATION - Rounded Subtle Hover */}
        <nav className="flex flex-col gap-1 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-zinc-900 text-white') 
                    : (theme === 'light' ? 'hover:bg-slate-50 text-slate-500' : 'hover:bg-zinc-900 hover:text-zinc-200 text-zinc-500')
                }`}
              >
                <item.icon size={18} className={isActive ? "text-blue-500" : "opacity-70"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* PROFILE SECTION - Minimalist Style */}
        <div className={`mt-auto px-4 pt-6 border-t ${theme === 'light' ? 'border-slate-200' : 'border-zinc-800'}`}>
          <Link href="/settings" className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-zinc-900'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 border ${theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-zinc-800 border-zinc-700'}`}>
              {userData.image ? (
                <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className={`text-[10px] font-bold ${theme === 'light' ? 'text-slate-600' : 'text-zinc-300'}`}>{userData.name.substring(0, 1)}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-medium truncate ${theme === 'light' ? 'text-slate-800' : 'text-zinc-200'}`}>{userData.name}</span>
              <span className={`text-[10px] truncate ${theme === 'light' ? 'text-slate-400' : 'text-zinc-500'}`}>{userData.email}</span>
            </div>
            <Settings size={14} className={`ml-auto group-hover:rotate-45 transition-transform ${theme === 'light' ? 'text-slate-400' : 'text-zinc-600'}`} />
          </Link>
        </div>
      </aside>
    </>
  );
}