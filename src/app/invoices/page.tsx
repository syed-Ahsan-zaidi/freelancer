"use client";

import React, { useState, useEffect } from "react";
import { X, FileText, Loader2, Plus, Receipt, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { createInvoice, getAllClients, getInvoices, updateInvoiceStatus } from "@/actions/invoices";

export default function InvoicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInitialData = async () => {
    setLoading(true);
    const [clientsRes, invoicesRes] = await Promise.all([getAllClients(), getInvoices()]);
    if (clientsRes.success) setClients(clientsRes.clients);
    if (invoicesRes.success) setInvoices(invoicesRes.invoices);
    setLoading(false);
  };

  useEffect(() => { loadInitialData(); }, []);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const res = await updateInvoiceStatus(id, currentStatus);
    if (res.success) {
      const updated = await getInvoices();
      if (updated.success) setInvoices(updated.invoices);
    }
  };

  const handleCommitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !amount) return;
    setIsSubmitting(true);
    try {
      const result = await createInvoice({ clientId, amount: parseFloat(amount) });
      if (result.success) {
        setIsModalOpen(false); setClientId(""); setAmount("");
        await loadInitialData();
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  if (loading) return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-blue-500">
      <Loader2 className="animate-spin mb-4" size={24} />
      <span className="tracking-widest uppercase text-[9px] font-black animate-pulse text-slate-400">Loading invoices...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 lg:p-10 w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md w-fit">
            <ShieldCheck size={10} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Financial Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
            Invoices
          </h1>
          <p className="text-slate-400 text-xs">Manage billing and transactions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md w-full sm:w-auto justify-center"
        >
          <Plus size={16} strokeWidth={3} /> New Invoice
        </button>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {invoices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <Receipt size={36} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No invoices yet</p>
          </div>
        ) : invoices.map(invoice => (
          <div key={invoice.id} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-blue-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-10 w-10 sm:h-11 sm:w-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 border border-blue-100 shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{invoice.client?.name || "Unknown"}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    #{invoice.id.slice(-6)} • {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-13 sm:pl-0">
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                  <p className="text-lg font-black text-slate-900">${invoice.amount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleStatusToggle(invoice.id, invoice.status)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all active:scale-95 text-[9px] font-black uppercase tracking-tight shrink-0 ${
                    invoice.status === "PAID"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-amber-50 text-amber-600 border-amber-200"
                  }`}
                >
                  {invoice.status === "PAID" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {invoice.status}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <FileText size={18} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Generate Invoice</h2>
            </div>
            <form onSubmit={handleCommitInvoice} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Client</label>
                <select
                  value={clientId} onChange={e => setClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  required
                >
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Amount ($)</label>
                <input
                  type="number" step="0.01" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  required
                />
              </div>
              {amount && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between"><span>Amount</span><span>${amount}</span></div>
                  <div className="flex justify-between"><span>Tax (10%)</span><span>${(Number(amount) * 0.1).toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200 mt-1">
                    <span>Total</span><span>${(Number(amount) * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Generate Invoice</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
