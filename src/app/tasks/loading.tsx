export default function TasksLoading() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-10 w-40 bg-slate-100 rounded-xl mb-2" />
      <div className="h-4 w-52 bg-slate-100 rounded-xl mb-8" />
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 h-12 border-b border-slate-200" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0" />
            <div className="h-4 flex-1 bg-slate-100 rounded-lg" />
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
