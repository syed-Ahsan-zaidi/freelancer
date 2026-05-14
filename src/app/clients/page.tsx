"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Trash, RefreshCw, Search, Users, ShieldCheck, UserPlus, Mail, X, Loader2 } from "lucide-react";
import { getClients, createClient, deleteClient } from "@/actions/clients";

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const data = await getClients();
      if (Array.isArray(data)) setClients(data as unknown as Client[]);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const result = await createClient({ name, email });
    if (result.success) {
      setName(""); setEmail(""); setOpen(false);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined" && confirm("Delete this client?")) {
      const result = await deleteClient(id);
      if (result.success) { loadData(); setActiveMenu(null); }
    }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-blue-500">
      <RefreshCw className="animate-spin mb-4" size={24} />
      <span className="tracking-widest uppercase text-[9px] font-black animate-pulse text-slate-400">Loading...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 lg:p-10 w-full">

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md w-fit">
            <ShieldCheck size={10} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Client Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic leading-none text-slate-900">
            Clients
          </h1>
          <p className="text-slate-400 text-xs">Manage your client profiles</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-xl transition-all shadow-md text-[10px] uppercase tracking-widest active:scale-95 w-full sm:w-auto justify-center"
        >
          <UserPlus size={15} /> Add Client
        </button>
      </header>

      {/* Search + Count */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-3 pl-11 rounded-xl focus:outline-none focus:border-blue-400 text-sm text-slate-700 transition-all"
          />
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex items-center gap-2 shrink-0">
          <Users size={14} className="text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total: {clients.length}</span>
        </div>
      </div>

      {/* Mobile Cards / Desktop Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Client</th>
                <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Email</th>
                <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-16 text-slate-300 text-[10px] uppercase font-black tracking-widest">
                    No clients found
                  </td>
                </tr>
              ) : (
                filtered.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {client.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{client.name}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Active</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-2 text-slate-500 text-[11px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-fit">
                        <Mail size={11} className="text-slate-400" /> {client.email}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === client.id ? null : client.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {activeMenu === client.id && (
                        <div className="absolute right-6 top-12 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-300 text-[10px] uppercase font-black tracking-widest">
              No clients found
            </div>
          ) : (
            filtered.map(client => (
              <div key={client.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {client.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{client.name}</p>
                    <p className="text-[10px] text-slate-400">{client.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <UserPlus size={18} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Add New Client</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Client name" required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Email</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="email@example.com" required
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95">
                Add Client
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
