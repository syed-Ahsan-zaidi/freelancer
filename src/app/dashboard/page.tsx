"use client";

import React, { useState, useEffect } from "react";
import {
  Search, ShieldCheck, DollarSign, Briefcase,
  FileText, ArrowUpRight, Plus, Zap, Bell, LayoutGrid, Activity, X, Loader2
} from "lucide-react";
import Link from "next/link";
import { createInvoice } from "@/actions/invoices";
import { getAllDashboardData } from "@/actions/dashboardActions";
import { markAllRead } from "@/actions/notifications";

export default function PremiumDashboard() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState({ clientId: "", amount: "" });
  const [isPending, setIsPending] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeProjects: 0,
    totalInvoices: 0,
    paidInvoices: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadAll() {
      const data = await getAllDashboardData();
      setClients(data.clients);
      setStats(data.stats);
      setRecentProjects(data.projects.slice(0, 3));
      setRecentTasks(data.tasks.slice(0, 3));
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
    }
    loadAll();
  }, []);

  const handleCreateInvoice = async () => {
    if (!invoiceData.clientId || !invoiceData.amount) return alert("Client aur Amount zaroori hain!");
    setIsPending(true);
    const res = await createInvoice({ clientId: invoiceData.clientId, amount: Number(invoiceData.amount) });
    setIsPending(false);
    if (res.success) {
      alert("Invoice successfully create ho gaya!");
      setShowInvoiceModal(false);
      setInvoiceData({ clientId: "", amount: "" });
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 lg:p-6 relative overflow-hidden">

      {/* Decorative Glow */}
      <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-blue-100 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center mb-6">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md w-fit">
            <ShieldCheck size={10} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500">Admin Control Active</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-slate-900">
            OPERATIONS <span className="text-slate-300">CENTER</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowNotifications(!showNotifications); }}
            className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-all relative"
          >
            <Bell size={16} className="text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        {[
          { label: "Net Revenue", val: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50", href: "/invoices" },
          { label: "Active Projects", val: `${stats.activeProjects} Projects`, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50", href: "/projects" },
          { label: "Total Invoices", val: `${stats.totalInvoices} Invoices`, icon: FileText, color: "text-purple-500", bg: "bg-purple-50", href: "/invoices" },
          { label: "Paid Invoices", val: `${stats.paidInvoices} Paid`, icon: Zap, color: "text-amber-500", bg: "bg-amber-50", href: "/invoices" },
        ].map((item, i) => (
          <Link key={i} href={item.href} className="bg-white border border-slate-200 p-5 rounded-[1.5rem] hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                <item.icon size={16} />
              </div>
              <ArrowUpRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.1em]">{item.label}</p>
            <h2 className="text-xl font-black tracking-tighter mt-1 text-slate-900">{item.val}</h2>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Projects */}
          <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[10px] font-black uppercase flex items-center gap-2 text-slate-700">
                <LayoutGrid size={12} className="text-blue-500" /> Recent Projects
              </h3>
              <Link href="/projects" className="text-[8px] font-black text-blue-500 uppercase hover:underline">View All</Link>
            </div>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                No projects yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          {project.image
                            ? <img src={project.image} className="w-full h-full object-cover" alt={project.title} />
                            : <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-slate-400">
                                {project.title?.charAt(0).toUpperCase()}
                              </div>
                          }
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">{project.title}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">{project.status} • ${project.budget || 0}</p>
                        </div>
                      </div>
                      <ArrowUpRight size={12} className="text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white border border-slate-200 p-6 rounded-[1.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Recent Tasks</span>
              </div>
              <Link href="/tasks" className="text-[8px] font-black text-blue-500 uppercase hover:underline">View All</Link>
            </div>
            {recentTasks.length === 0 ? (
              <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest text-center py-4">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-700 truncate flex-1">{task.title}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ml-3 shrink-0 ${
                      task.status === "DONE" ? "bg-emerald-50 text-emerald-600" :
                      task.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-600" :
                      "bg-blue-50 text-blue-500"
                    }`}>{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Column */}
        <div className="space-y-6">
          {/* Invoice Button */}
          <div
            onClick={() => setShowInvoiceModal(true)}
            className="bg-blue-600 p-8 rounded-[2rem] shadow-lg shadow-blue-200 group cursor-pointer relative overflow-hidden h-[180px] flex flex-col justify-center transition-transform active:scale-[0.98]"
          >
            <div className="relative z-10">
              <h3 className="text-white font-black italic uppercase text-2xl leading-[0.9] mb-1">Generate<br />New Invoice</h3>
              <p className="text-blue-100 text-[8px] font-bold uppercase tracking-widest mb-6 opacity-80 italic">Sync Billing with Client Portal</p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl group-hover:bg-blue-50 transition-colors">
                <Plus size={14} /> Create Now
              </div>
            </div>
            <DollarSign size={120} className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Deadlines */}
          <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-[9px] font-black uppercase text-slate-400 mb-6 italic">Active Deadlines</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-0.5 h-10 bg-red-400 rounded-full" />
                <div>
                  <p className="text-[11px] font-black uppercase text-slate-700">Research Portal Fix</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Due Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Slide-in Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-[99999] flex justify-end" onClick={() => setShowNotifications(false)}>
          <div
            className="w-80 h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-blue-500" />
                <span className="text-sm font-bold text-slate-800">Notifications</span>
              </div>
              <button onClick={() => setShowNotifications(false)}>
                <X size={18} className="text-slate-400 hover:text-slate-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <Bell size={28} className="mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No notifications yet</p>
                </div>
              ) : notifications.map((n: any) => {
                const colorMap: Record<string, string> = {
                  INVOICE: "bg-blue-500",
                  PROJECT: "bg-emerald-500",
                  TASK: "bg-purple-500",
                };
                const color = colorMap[n.type] || "bg-slate-400";
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer ${n.isRead ? "bg-white hover:bg-slate-50" : "bg-blue-50 hover:bg-blue-100"}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-snug">{n.message}</p>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{n.type} • {new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                    {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={async () => { await markAllRead(); setUnreadCount(0); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }}
                className="text-[11px] text-blue-500 font-bold hover:underline w-full text-center"
              >
                Mark All as Read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowInvoiceModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Generate Invoice</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Client</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  value={invoiceData.clientId}
                  onChange={e => setInvoiceData({ ...invoiceData, clientId: e.target.value })}
                >
                  <option value="">Client select karo...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  value={invoiceData.amount}
                  onChange={e => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Amount</span><span>${invoiceData.amount || "0"}</span></div>
                <div className="flex justify-between"><span>Tax (10%)</span><span>${invoiceData.amount ? (Number(invoiceData.amount) * 0.1).toFixed(2) : "0"}</span></div>
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200 mt-1">
                  <span>Total</span>
                  <span>${invoiceData.amount ? (Number(invoiceData.amount) * 1.1).toFixed(2) : "0"}</span>
                </div>
              </div>

              <button
                onClick={handleCreateInvoice}
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Generate Invoice</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
