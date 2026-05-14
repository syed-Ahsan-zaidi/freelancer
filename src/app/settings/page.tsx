import Link from "next/link";
import { Github as GitHubIcon, ExternalLink, Mail, User, Shield, Bell } from "lucide-react";
import { getUser } from "@/actions/user";
import LogoutButton from "@/components/ui/LogoutButton";

const settings = [
  {
    title: "Public Profile",
    description: "Manage how your portfolio and GitHub links appear.",
    icon: User,
    href: "/settings/profile",
    color: "text-blue-400"
  },
  {
    title: "Account Security",
    description: "Update your password and secure your credentials.",
    icon: Shield,
    href: "/settings/security",
    color: "text-emerald-400"
  },
  {
    title: "Notifications",
    description: "Choose when to get alerted about new inquiries.",
    icon: Bell,
    href: "/settings/notifications",
    color: "text-orange-400"
  }
];

export default async function SettingsPage() {
  // Database se latest data fetch karein
  const user = await getUser("ayeshaqq36@gmail.com");

  return (
    <div className="p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="mb-10">
        <h2 className="text-blue-500 text-[10px] font-black tracking-widest uppercase mb-2">Control Panel</h2>
        <h1 className="text-4xl font-bold text-white tracking-tight">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {settings.map((item, i) => (
            <Link key={i} href={item.href} className="group block">
              <div className="flex items-center justify-between p-6 bg-[#151B2D] border border-white/5 rounded-3xl hover:border-blue-500/30 hover:bg-[#1a2138] transition-all duration-300 shadow-lg shadow-black/10">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl bg-white/5 ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-slate-400 text-sm">{item.description}</p>
                  </div>
                </div>
                <ExternalLink size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Right Side: Dynamic Profile Sidebar Card */}
        <div className="bg-[#151B2D] border border-white/5 rounded-[40px] p-8 h-fit sticky top-8 shadow-2xl shadow-black/20 overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative flex flex-col items-center text-center">
            <Link href="/settings/profile" className="relative mb-4 group/avatar">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 p-1 transition-transform group-hover/avatar:scale-105">
                <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center overflow-hidden border-4 border-[#151B2D]">
                  {user?.image ? (
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : "AK"}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full border-4 border-[#151B2D] text-white">
                <User size={12} fill="currentColor" />
              </div>
            </Link>

            {/* Database se dynamic Name aur Role */}
            <h3 className="text-xl font-bold text-white">{user?.name || "Ayesha Khalid"}</h3>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1 mb-6">
              {user?.bio ? "Web Developer" : "Update your bio"}
            </p>
            
            <div className="w-full space-y-4 pt-6 border-t border-white/5 text-slate-400 text-sm">
              <div className="flex items-center gap-3 py-1 group/link">
                <Mail size={16} /> 
                <span className="truncate">{user?.email || "ayeshaqq36@gmail.com"}</span>
              </div>
              
              <a href="https://github.com/AyeshaKhalid8902" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors py-1">
                <GitHubIcon size={16} /> 
                <span>github.com/AyeshaKhalid8902</span>
              </a>
            </div>
            
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}