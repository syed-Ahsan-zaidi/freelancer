"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Github, Chrome, ShieldCheck, LogOut, ArrowRight, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [isVerified, setIsVerified] = useState(false);

  const handleCaptchaChange = (value: string | null) => {
    setIsVerified(!!value);
  };

  // Authenticated state
  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center"
        >
          {session.user?.image ? (
            <img src={session.user.image} alt="User Avatar" className="w-20 h-20 rounded-full mx-auto mb-5 border-4 border-blue-500 shadow-lg" />
          ) : (
            <UserCircle size={72} className="text-slate-300 mx-auto mb-5" />
          )}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Welcome Back!</h1>
          <p className="text-slate-800 font-bold mb-1">{session.user?.name}</p>
          <p className="text-slate-400 text-sm mb-8">{session.user?.email}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-500 border border-red-200 py-3.5 rounded-xl font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all group"
            >
              Go to Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200"
          >
            <ShieldCheck className="text-white" size={28} />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">
            Freelance Tracker<span className="text-blue-500">.</span>
          </h1>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Verify Your Identity</p>
        </div>

        {/* Social Buttons */}
        <div className="space-y-3 mb-6">
          <button
            disabled={!isVerified}
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className={`w-full flex items-center justify-center gap-3 border py-3.5 rounded-xl font-bold transition-all group text-sm ${
              !isVerified
                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                : "bg-slate-900 border-slate-900 text-white hover:bg-slate-700 cursor-pointer"
            }`}
          >
            <Github size={20} className="group-hover:scale-110 transition-transform" />
            Continue with GitHub
          </button>

          <button
            disabled={!isVerified}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className={`w-full flex items-center justify-center gap-3 border py-3.5 rounded-xl font-bold transition-all group text-sm ${
              !isVerified
                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <Chrome size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6 flex items-center">
          <div className="flex-1 border-t border-slate-200" />
          <span className="mx-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Security Check</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* reCAPTCHA */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full flex justify-center">
            <ReCAPTCHA
              sitekey="6LfdaLgsAAAAANcwcM-uwf5pW39bSbjhb-S1V5FW"
              onChange={handleCaptchaChange}
              theme="light"
              size="normal"
            />
          </div>
          {!isVerified && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-blue-500 text-center mt-3 font-bold uppercase tracking-widest"
            >
              Complete verification to continue
            </motion.p>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Freelance Tracker — Secure Login</p>
        </div>
      </motion.div>
    </div>
  );
}
