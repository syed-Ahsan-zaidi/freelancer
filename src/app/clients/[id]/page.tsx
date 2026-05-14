"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, FolderOpen, Receipt, Loader2,
  CheckCircle2, Clock, AlertCircle, DollarSign, TrendingUp, Briefcase
} from "lucide-react";
import { getClientById } from "@/actions/clients";

type Project = {
  id: string; title: string; status: string;
  budget: number | null; image: string | null; createdAt: string;
};
type Invoice = {
  id: string; invoiceNo: string; amount: number; total: number;
  status: string; dueDate: string; createdAt: string;
};
type Client = {
  id: string; name: string; email: string | null;
  company: string | null; address: string | null; createdAt: string;
  projects: Project[]; invoices: Invoice[];
};

function statusColor(status: string) {
  if (status === "PAID") return "bg-emerald-50 text-emerald-600";
  if (status === "OVERDUE") return "bg-red-50 text-red-500";
  return "bg-amber-50 text-amber-600";
}

function projectStatusColor(status: string) {
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-600";
  if (status === "ON_HOLD") return "bg-amber-50 text-amber-600";
  return "bg-blue-50 text-blue-600";
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "invoices">("projects");

  useEffect(() => {
    async function load() {
      const data = await getClientById(params.id as string);
      setClient(data as Client | null);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-blue-500">
      <Loader2 className="animate-spin mb-4" size={32} />
      <span className="tracking-widest uppercase text-[9px] font-black animate-pulse text-slate-400">Loading client...</span>
    </div>
  );

  if (!client) return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-slate-400 font-bold">Client not found</p>
      <Link href="/clients" className="text-blue-500 text-sm font-bold hover:underline">← Back to Clients</Link>
    </div>
  );

  const totalRevenue = client.invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const unpaidTotal = client.invoices.filter(i => i.status !== "PAID").reduce((s, i) => s + i.total, 0);

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 lg:p-10 w-full">

      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-xs font-bold mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Clients
      </button>

      {/* Client Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{client.name}</h1>
            {client.email && (
              <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                <Mail size={13} /> {client.email}
              </div>
            )}
            {client.company && <p className="text-xs text-slate-400 mt-1">{client.company}</p>}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Projects</p>
            <p className="text-2xl font-black text-blue-600">{client.projects.length}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Invoices</p>
            <p className="text-2xl font-black text-slate-700">{client.invoices.length}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">Revenue</p>
            <p className="text-2xl font-black text-emerald-600">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">Unpaid</p>
            <p className="text-2xl font-black text-amber-600">${unpaidTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "projects"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <Briefcase size={13} /> Projects ({client.projects.length})
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "invoices"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <Receipt size={13} /> Invoices ({client.invoices.length})
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {client.projects.length === 0 ? (
            <div className="py-16 text-center text-slate-300 text-[10px] uppercase font-black tracking-widest">
              No projects yet
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Project</th>
                      <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                      <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {client.projects.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <Link href={`/projects/${p.id}`} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <FolderOpen size={14} className="text-blue-500" />
                            </div>
                            <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{p.title}</span>
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${projectStatusColor(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-black text-sm text-slate-700">
                            {p.budget ? `$${p.budget.toLocaleString()}` : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="sm:hidden divide-y divide-slate-100">
                {client.projects.map(p => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <FolderOpen size={15} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{p.title}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${projectStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-sm text-slate-500">
                      {p.budget ? `$${p.budget.toLocaleString()}` : "—"}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {client.invoices.length === 0 ? (
            <div className="py-16 text-center text-slate-300 text-[10px] uppercase font-black tracking-widest">
              No invoices yet
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Invoice #</th>
                      <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                      <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                      <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {client.invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Receipt size={14} className="text-slate-400" />
                            <span className="font-bold text-sm text-slate-800">{inv.invoiceNo}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusColor(inv.status)}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-black text-sm text-slate-700">${inv.total.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-xs text-slate-400">{new Date(inv.dueDate).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="sm:hidden divide-y divide-slate-100">
                {client.invoices.map(inv => (
                  <div key={inv.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Receipt size={15} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{inv.invoiceNo}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-sm text-slate-700">${inv.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
