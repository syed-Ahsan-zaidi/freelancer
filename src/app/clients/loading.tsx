export default function ClientsLoading() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-10 w-32 bg-slate-100 rounded-xl mb-2" />
      <div className="h-4 w-48 bg-slate-100 rounded-xl mb-8" />
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 h-12 border-b border-slate-200" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-100 rounded-lg" />
              <div className="h-3 w-48 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
