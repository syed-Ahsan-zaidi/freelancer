"use client";
import { useState, useEffect } from "react";
import { Plus, ExternalLink, X, Camera, LayoutGrid, Search, Filter } from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "@/actions/dashboardActions";
import { createProject } from "@/actions/projectActions";

export default function ProjectsGallery() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newProject, setNewProject] = useState({ 
    title: "", 
    description: "", 
    category: "Web Development", 
    budget: "",
    image: "",
    clientId: "" 
  });

  useEffect(() => {
    async function load() {
      try {
        const data: any = await getDashboardData(); 
        setProjects(data.projects || []);
        setClients(data.clients || []);
      } catch (e) { 
        console.error("Fetch Error:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    load();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.url) {
          setNewProject({ ...newProject, image: data.url });
        }
      } catch (err) {
        alert("Image upload failed. Please try again.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.image) return alert("Please select an image!");
    if (!newProject.clientId) return alert("Please select a client!");

    try {
      const res = await createProject({
        ...newProject,
        budget: Number(newProject.budget),
        clientId: newProject.clientId,
        status: "ACTIVE"
      });

      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        alert("Error: " + res.error);
      }
    } catch (err) { 
      alert("Failed to connect to server."); 
    }
  };

  if (loading) return (
    <div className="h-screen w-full bg-white flex items-center justify-center text-blue-500 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <LayoutGrid className="animate-spin" size={40} />
        <span className="tracking-widest uppercase text-[10px] font-bold text-slate-400">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-2 block">Portfolio Pipeline</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
            Projects
          </h1>
          <p className="text-slate-400 text-sm mt-2">Manage and showcase your freelance deliverables.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 w-full sm:w-auto justify-center text-[11px] uppercase tracking-widest"
        >
          <Plus size={18} /> Add Project
        </button>
      </header>

      {/* Search */}
      <div className="relative z-10 flex gap-3 mb-8 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter by title..."
            className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-11 rounded-xl focus:outline-none focus:border-blue-400 transition-all text-sm text-slate-700"
          />
        </div>
        <button className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* Projects Grid */}
      <div className="relative z-10">
        {projects.length === 0 ? (
          <div className="min-h-[350px] w-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-10">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <LayoutGrid className="text-slate-300" size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No projects yet</h3>
            <p className="text-slate-400 text-sm text-center max-w-[220px]">Add your first project to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
            {projects.map((project) => (
              <div key={project.id} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col shadow-sm">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={project.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">${project.budget}</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors text-slate-800">{project.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">{project.description || 'No description provided.'}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                    </div>
                    <Link href={`/projects/${project.id}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all">
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900">
              New <span className="text-blue-500">Project</span>
            </h2>
            <form onSubmit={handleLaunch} className="space-y-4">
              <div className="relative w-full h-36 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-all">
                {newProject.image ? (
                  <img src={newProject.image} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <Camera size={28} className="text-slate-300 mb-2" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Upload Image</span>
                  </>
                )}
                <input type="file" required accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 block">Client</label>
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  value={newProject.clientId}
                  onChange={e => setNewProject({...newProject, clientId: e.target.value})}
                >
                  <option value="">Select client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <input
                required placeholder="Project title"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                onChange={e => setNewProject({...newProject, title: e.target.value})}
              />

              <textarea
                placeholder="Description..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:border-blue-400 h-24 resize-none transition-all text-slate-700"
                onChange={e => setNewProject({...newProject, description: e.target.value})}
              />

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number" required placeholder="Budget"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-8 text-sm outline-none focus:border-blue-400 transition-all text-slate-700"
                  onChange={e => setNewProject({...newProject, budget: e.target.value})}
                />
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm active:scale-95">
                Add Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}