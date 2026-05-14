export default function InvoicesLoading() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-10 w-36 bg-slate-100 rounded-xl mb-2" />
      <div className="h-4 w-52 bg-slate-100 rounded-xl mb-8" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-100 rounded-lg" />
              <div className="h-3 w-40 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-7 w-16 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
