"use client"
import React, { useState, useEffect } from "react";
import { Trash2, Plus, LayoutGrid, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { getProjects, createProject, deleteProject } from "@/actions/projects";

export default function TechnicalDashboard() {
  // --- 1. All States at the Top ---
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Web Development",
    budget: 0,
    image: "",
    clientId: "" 
  });

  // --- 2. Data Loading Logic ---
  const loadData = async () => {
    const res = await getProjects();
    if (res.success) setProjects(res.projects);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // --- 3. Image Upload & Compression ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image bohot bari hai! Please 2MB se choti image use karein.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, image: compressedDataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 4. Form Submission (Cleaned up and Integrated) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manual check for image since Base64 doesn't trigger HTML 'required'
    if (!formData.image) {
      alert("Please upload an image first!");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createProject({ 
        ...formData, 
        status: activeStatus, 
        clientId: formData.clientId || "cmoiqfa670004v7psnqz6zlrt" 
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormData({ title: "", category: "Web Development", budget: 0, image: "", clientId: "" });
        await loadData();
      } else {
        alert("Project save nahi ho saka. Dobara koshish karein.");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Kuch masla hua hai, console check karein.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Delete this project?")) {
      await deleteProject(id);
      loadData();
    }
  };

  const columns = [
    { title: "TO DRAFT", status: "draft" },
    { title: "IN PROGRESS", status: "progress" },
    { title: "REVIEW", status: "review" }
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-10">
      <header className="mb-12">
        <p className="text-blue-500 text-[10px] font-black tracking-[0.2em] uppercase">Pipeline</p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mt-2">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col gap-8">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[11px] font-black tracking-widest text-slate-500 uppercase">{col.title}</h2>
              <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md">
                {projects.filter(p => p.status === col.status).length}
              </span>
            </div>

            {/* CARDS LIST */}
            <div className="flex flex-col gap-8">
              {projects.filter(p => p.status === col.status).map((project) => (
                <div key={project.id} className="bg-[#151B2D] rounded-[45px] overflow-hidden border border-white/5 group hover:border-blue-500/30 transition-all">
                  <div className="aspect-video bg-slate-800/50 relative overflow-hidden">
                    {project.image ? (
                      <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10"><LayoutGrid size={40}/></div>
                    )}
                  </div>
                  <div className="p-8">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{project.category}</span>
                    <h4 className="text-2xl font-bold mt-2 mb-6 group-hover:text-blue-400 transition-colors line-clamp-1">{project.title}</h4>
                    <div className="flex justify-between items-center pt-5 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black italic text-white">AK</div>
                        <span className="text-[11px] text-slate-400 font-medium">Ayesha Khalid</span>
                      </div>
                      <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-slate-600 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => { setActiveStatus(col.status); setIsModalOpen(true); }}
              className="group border-2 border-dashed border-white/5 rounded-[45px] py-14 flex flex-col items-center justify-center bg-white/[0.01] hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all active:scale-95"
            >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all">
                <Plus className="text-slate-500 group-hover:text-blue-500" />
              </div>
              <span className="text-[10px] font-black mt-4 text-slate-500 group-hover:text-blue-500 tracking-widest uppercase">Add Project</span>
            </button>
          </div>
        ))}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#151B2D] w-full max-w-md rounded-[50px] p-10 border border-white/10 shadow-2xl overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Project Info</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[35px] overflow-hidden group">
                {formData.image ? (
                  <div className="relative w-full h-full">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, image: ""})}
                      className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full hover:bg-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <ImageIcon size={30} className="text-slate-600 mb-2" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">Gallery</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <input 
                  required placeholder="Project Title"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                
                <input 
                  required placeholder="Client ID"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 transition-all"
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                />

                <select 
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-sm outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Mobile App">Mobile App</option>
                </select>
                <input 
                  type="number" placeholder="Budget ($)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 transition-all"
                  value={formData.budget || ""}
                  onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[25px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "SAVE PROJECT"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}