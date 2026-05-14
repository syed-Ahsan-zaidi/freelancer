"use client";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Camera, Save, X, Plus, FileText, Trash2, Tag, BookOpen, ExternalLink, Upload } from "lucide-react";
import Link from "next/link";
import { updateProject } from "@/actions/projectActions";
import { getResearchByProject, createResearch, deleteResearch } from "@/actions/researchActions";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [project, setProject] = useState<any>(null);
  const [researchList, setResearchList] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<"overview" | "research">("overview");
  const [saving, setSaving] = useState(false);

  const [newResearch, setNewResearch] = useState({
    title: "",
    content: "",
    fileUrl: "",
    tags: "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setEditData(data);
      })
      .catch(err => console.error("Error fetching project:", err));

    loadResearch();
  }, [id]);

  async function loadResearch() {
    const res = await getResearchByProject(id);
    if (res.success) setResearchList(res.data);
  }

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
        if (data.url) setEditData({ ...editData, image: data.url });
      } catch {
        alert("Image upload failed.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    setSaving(true);
    const res = await updateProject(id, {
      name: editData.name,
      description: editData.description,
      totalBudget: editData.totalBudget?.toString(),
      status: editData.status,
      image: editData.image,
    });
    setSaving(false);
    if (res?.success) {
      setIsEditModalOpen(false);
      window.location.reload();
    } else {
      alert("Error updating project.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const isPdf = file.type === "application/pdf";
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: base64,
            fileType: isPdf ? "pdf" : "image",
          }),
        });
        const data = await res.json();
        if (data.url) {
          setNewResearch(prev => ({ ...prev, fileUrl: data.url }));
        } else {
          alert("Upload failed: " + data.error);
        }
      } catch {
        alert("File upload failed.");
      } finally {
        setUploadingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = newResearch.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const res = await createResearch({
      projectId: id,
      title: newResearch.title,
      content: newResearch.content,
      fileUrl: newResearch.fileUrl || undefined,
      tags: tagsArray,
    });

    if (res.success) {
      setIsResearchModalOpen(false);
      setNewResearch({ title: "", content: "", fileUrl: "", tags: "" });
      loadResearch();
    } else {
      alert("Error adding research: " + res.error);
    }
  };

  const handleDeleteResearch = async (researchId: string) => {
    if (!confirm("Delete this research entry?")) return;
    const res = await deleteResearch(researchId, id);
    if (res.success) loadResearch();
  };

  if (!project) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        <p className="text-slate-400 text-sm animate-pulse">Loading project...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Top Nav */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/projects" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
          >
            Edit Project
          </button>
        </div>

        {/* Project Header */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-6">
          <div className="relative h-56 sm:h-72 w-full">
            <img
              src={project.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"}
              className="w-full h-full object-cover"
              alt={project.title || project.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                {project.title || project.name}
              </h1>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30 uppercase backdrop-blur-sm">
                  {project.status || "Active"}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
                  Budget: ${project.budget || project.totalBudget || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors mr-2 ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("research")}
              className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "research"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <BookOpen size={14} />
              Research & Notes
              {researchList.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {researchList.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">Project Description</h3>
                <p className="text-slate-500 leading-relaxed">
                  {project.description || "No description provided for this project."}
                </p>
              </div>
            )}

            {activeTab === "research" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Research & Notes</h3>
                  <button
                    onClick={() => setIsResearchModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <Plus size={14} /> Add Research
                  </button>
                </div>

                {researchList.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <BookOpen className="text-slate-300 mx-auto mb-3" size={36} />
                    <p className="text-slate-400 font-medium text-sm">No research data yet</p>
                    <p className="text-slate-300 text-xs mt-1">Add notes, papers, or links for this project</p>
                    <button
                      onClick={() => setIsResearchModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-blue-50 text-blue-500 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all"
                    >
                      + Add First Entry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {researchList.map((item) => (
                      <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-all group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{item.title}</h4>
                              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{item.content}</p>

                              {item.fileUrl && (
                                <a
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 mt-2 text-blue-500 hover:text-blue-700 text-xs font-bold"
                                >
                                  <ExternalLink size={12} /> View File
                                </a>
                              )}

                              {item.tags && item.tags.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap mt-3">
                                  {item.tags.map((tag: string, i: number) => (
                                    <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-500 text-[10px] font-bold rounded-full border border-blue-100">
                                      <Tag size={9} /> {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <p className="text-slate-300 text-[10px] mt-2">
                                {new Date(item.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteResearch(item.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900">Edit <span className="text-blue-500">Project</span></h2>

            <div className="space-y-4">
              <div className="relative w-full h-36 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-400 transition-all">
                {editData?.image ? (
                  <img src={editData.image} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera size={24} className="text-slate-300" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Upload Image</span>
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold uppercase">
                  Change Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <input
                placeholder="Project Name"
                value={editData?.name || editData?.title || ""}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:border-blue-400 outline-none transition-all"
                onChange={e => setEditData({ ...editData, name: e.target.value })}
              />
              <input
                type="number" placeholder="Budget ($)"
                value={editData?.totalBudget || editData?.budget || ""}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:border-blue-400 outline-none transition-all"
                onChange={e => setEditData({ ...editData, totalBudget: e.target.value })}
              />
              <select
                value={editData?.status || "ACTIVE"}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:border-blue-400 outline-none transition-all text-slate-700"
                onChange={e => setEditData({ ...editData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <textarea
                placeholder="Description"
                value={editData?.description || ""}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm h-28 outline-none focus:border-blue-400 resize-none transition-all"
                onChange={e => setEditData({ ...editData, description: e.target.value })}
              />
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Research Modal */}
      {isResearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsResearchModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Add <span className="text-blue-500">Research</span></h2>
            </div>

            <form onSubmit={handleAddResearch} className="space-y-4">
              <input
                required
                placeholder="Title (e.g. Market Research, Meeting Notes)"
                value={newResearch.title}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:border-blue-400 outline-none transition-all"
                onChange={e => setNewResearch({ ...newResearch, title: e.target.value })}
              />
              <textarea
                required
                placeholder="Content / Notes / Summary..."
                value={newResearch.content}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm h-32 outline-none focus:border-blue-400 resize-none transition-all"
                onChange={e => setNewResearch({ ...newResearch, content: e.target.value })}
              />
              {/* File Upload */}
              <div className="space-y-2">
                <label className="relative flex items-center gap-3 w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 p-3.5 rounded-xl cursor-pointer transition-all group">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Upload size={14} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {uploadingFile ? (
                      <span className="text-blue-500 text-sm font-medium animate-pulse">Uploading...</span>
                    ) : newResearch.fileUrl ? (
                      <span className="text-emerald-600 text-sm font-medium truncate block">✓ File uploaded</span>
                    ) : (
                      <span className="text-slate-400 text-sm">Click to upload PDF or image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                </label>
                <div className="relative">
                  <input
                    placeholder="Or paste a file URL / link (optional)"
                    value={newResearch.fileUrl}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:border-blue-400 outline-none transition-all text-slate-500"
                    onChange={e => setNewResearch({ ...newResearch, fileUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="relative">
                <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Tags (comma separated: design, ux, research)"
                  value={newResearch.tags}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-10 rounded-xl text-sm focus:border-blue-400 outline-none transition-all"
                  onChange={e => setNewResearch({ ...newResearch, tags: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Save Research Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
