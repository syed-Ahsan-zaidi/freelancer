// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // Jab koi main site par aaye, wo seedha dashboard par chala jaye
  redirect("/dashboard");
  
  // Ya agar aap koi simple welcome screen dikhana chahti hain:
  /*
  return (
    <div className="h-screen bg-black flex items-center justify-center">
       <h1 className="text-white font-black italic uppercase">Welcome to Portal</h1>
    </div>
  );
  */
}