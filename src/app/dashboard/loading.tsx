export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white p-4 lg:p-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-100 rounded-xl mb-2" />
      <div className="h-5 w-32 bg-slate-100 rounded-xl mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-2xl h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-100 rounded-2xl h-64" />
        <div className="bg-slate-100 rounded-2xl h-64" />
      </div>
    </div>
  );
}
