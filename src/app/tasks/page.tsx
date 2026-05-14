"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, MoreVertical, Trash2, Loader2, X, Circle, Zap, FolderOpen, DollarSign, Receipt } from "lucide-react";
import Link from "next/link";
import { createNewTask, getDashboardData, deleteTask, updateTaskStatus } from "@/actions/dashboardActions";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [selectedProjectTitle, setSelectedProjectTitle] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardData();
      setTasks(data.tasks || []);
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCircleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "PENDING" : "DONE";
    const result = await updateUIAndDb(id, newStatus);
    if (newStatus === "DONE" && result?.autoInvoice) {
      showToast("Task complete! Invoice automatically created & marked PAID.");
    }
  };

  const handleTextStatusToggle = async (id: string, currentStatus: string) => {
    let newStatus = "";
    if (currentStatus === "PENDING" || currentStatus === "DRAFT") newStatus = "IN_PROGRESS";
    else if (currentStatus === "IN_PROGRESS") newStatus = "DONE";
    else newStatus = "PENDING";
    updateUIAndDb(id, newStatus);
  };

  const updateUIAndDb = async (id: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      const result = await updateTaskStatus(id, newStatus);
      return result;
    } catch { fetchData(); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setIsSubmitting(true);
    try {
      const result = await createNewTask({
        title: newTitle,
        status: "PENDING",
        price: newPrice ? Number(newPrice) : undefined,
        projectId: newProjectId || undefined,
      });
      if (result.success) {
        setNewTitle(""); setNewPrice(""); setNewProjectId("");
        setSelectedProjectTitle(""); setIsModalOpen(false);
        await fetchData();
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined" && !confirm("Delete this task?")) return;
    const result = await deleteTask(id);
    if (result.success) { await fetchData(); setActiveMenu(null); }
  };

  if (loading) return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-blue-500">
      <Loader2 className="animate-spin mb-4" size={32} />
      <span className="tracking-widest uppercase text-[9px] font-black animate-pulse text-slate-400">Loading tasks...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 lg:p-10 w-full">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-bottom-4">
          <Receipt size={18} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md w-fit">
            <Zap size={10} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Task Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
            Project <span className="text-blue-500 not-italic">Tasks</span>
          </h1>
          <p className="text-slate-400 text-xs">Track and manage your milestones</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md w-full sm:w-auto justify-center"
        >
          <Plus size={16} strokeWidth={3} /> Add Task
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Task</th>
              <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Project</th>
              <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
              <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-16 text-slate-300 text-[10px] uppercase font-black tracking-widest">
                  No tasks found
                </td>
              </tr>
            ) : tasks.map(task => {
              const isDone = task.status === "DONE";
              const isInProgress = task.status === "IN_PROGRESS";
              return (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleCircleToggle(task.id, task.status)} className="hover:scale-110 transition-transform shrink-0">
                        {isDone
                          ? <CheckCircle2 size={22} className="text-emerald-500" strokeWidth={2} />
                          : <Circle size={22} className="text-slate-300 hover:text-blue-500 transition-colors" strokeWidth={2} />
                        }
                      </button>
                      <span className={`text-sm font-bold transition-all ${isDone ? "line-through text-slate-300" : "text-slate-800"}`}>
                        {task.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {task.project ? (
                      <Link href={`/projects/${task.project.id}`} className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-xs font-bold transition-colors">
                        <FolderOpen size={13} />
                        {task.project.title}
                      </Link>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => handleTextStatusToggle(task.id, task.status)} className="inline-block">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        isDone ? "bg-emerald-50 text-emerald-600" :
                        isInProgress ? "bg-amber-50 text-amber-600" :
                        "bg-blue-50 text-blue-500"
                      }`}>
                        {isDone ? "Done" : isInProgress ? "In Progress" : "Pending"}
                      </span>
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right relative">
                    <button onClick={() => setActiveMenu(activeMenu === task.id ? null : task.id)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu === task.id && (
                      <div className="absolute right-6 top-12 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <button onClick={() => handleDelete(task.id)} className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-300 text-[10px] uppercase font-black tracking-widest">
            No tasks found
          </div>
        ) : tasks.map(task => {
          const isDone = task.status === "DONE";
          const isInProgress = task.status === "IN_PROGRESS";
          return (
            <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => handleCircleToggle(task.id, task.status)} className="shrink-0">
                  {isDone
                    ? <CheckCircle2 size={20} className="text-emerald-500" />
                    : <Circle size={20} className="text-slate-300" />
                  }
                </button>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${isDone ? "line-through text-slate-300" : "text-slate-800"}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      isDone ? "text-emerald-500" : isInProgress ? "text-amber-500" : "text-blue-500"
                    }`}>
                      {isDone ? "Done" : isInProgress ? "In Progress" : "Pending"}
                    </span>
                    {task.project && (
                      <Link href={`/projects/${task.project.id}`} className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-blue-500 transition-colors">
                        <FolderOpen size={10} /> {task.project.title}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(task.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Plus size={18} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Add New Task</h2>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Task Title</label>
                <input
                  type="text" value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Project (optional)</label>
                <select
                  value={newProjectId}
                  onChange={e => setNewProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                >
                  <option value="">No project</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block flex items-center gap-1">
                  <DollarSign size={10} /> Task Amount — Auto Invoice on Complete
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number" min="0" value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    placeholder="0 (leave empty if no invoice needed)"
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-8 rounded-xl text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  />
                </div>
                {newPrice && Number(newPrice) > 0 && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                    <Receipt size={10} /> Task complete hone par ${newPrice} ka PAID invoice auto-create hoga
                  </p>
                )}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : "Add Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
