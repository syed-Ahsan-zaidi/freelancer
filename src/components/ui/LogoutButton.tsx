"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full mt-8 bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-white text-sm font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group/logout"
    >
      <LogOut size={18} className="group-hover/logout:translate-x-1 transition-transform" />
      Log Out
    </button>
  );
}
