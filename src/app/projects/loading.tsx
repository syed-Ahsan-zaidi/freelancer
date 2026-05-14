export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-10 w-40 bg-slate-100 rounded-xl mb-2" />
      <div className="h-4 w-56 bg-slate-100 rounded-xl mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-3xl overflow-hidden">
            <div className="h-48 bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-3 w-full bg-slate-200 rounded-lg" />
              <div className="h-3 w-2/3 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
