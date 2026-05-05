"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Plus, Users, LayoutList, ChevronRight, Server } from "lucide-react";
import { useSession } from "next-auth/react";

type Project = {
  id: string;
  name: string;
  description: string;
  adminId: string;
  admin: { name: string };
  _count: { members: number; tasks: number };
  createdAt: string;
};

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setDescription("");
        fetchProjects();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-xs text-[var(--primary)] animate-pulse tracking-widest">SCANNING DATABASES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[var(--border)] pb-4 mb-8 relative">
        <div className="absolute -bottom-px left-0 w-1/3 h-px bg-gradient-to-r from-[var(--primary)] to-transparent"></div>
        <div>
          <h1 className="text-2xl font-mono font-bold mb-1 tracking-wider uppercase text-[var(--primary)]">Data Nodes</h1>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Active project repositories</p>
        </div>
        {session?.user?.email === 'admin@ethara.ai' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />
            INITIALIZE NODE
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16 flex flex-col items-center border-dashed border-2 border-[var(--border)] bg-[rgba(0,243,255,0.02)]">
          <div className="w-16 h-16 bg-[rgba(0,243,255,0.05)] border border-[var(--primary)] rounded-sm flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Server className="w-8 h-8 text-[var(--primary)] animate-pulse" />
          </div>
          <h3 className="text-lg font-mono font-bold mb-2 tracking-widest uppercase text-white">NO ACTIVE NODES</h3>
          <p className="text-[var(--primary)] opacity-60 font-mono text-xs mb-8 max-w-md uppercase tracking-wider leading-relaxed">Initialize your first data node to begin task allocation and team synchronization.</p>
          {session?.user?.email === 'admin@ethara.ai' ? (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              INITIALIZE NODE
            </button>
          ) : (
            <div className="p-3 bg-[rgba(255,0,85,0.05)] border border-[rgba(255,0,85,0.2)] text-[10px] text-[var(--danger)] uppercase tracking-widest font-mono">
              ONLY ROOT ADMIN CAN INITIALIZE NEW NODES.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="block group">
              <div className="card h-full flex flex-col hover:bg-[rgba(0,243,255,0.02)] relative overflow-hidden transition-all duration-300">
                {/* Highlight for admin projects */}
                {project.adminId === session?.user?.id && (
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-2 -right-6 bg-[var(--primary)] text-[#030712] text-[9px] font-mono font-bold uppercase py-1 px-8 transform rotate-45 shadow-[0_0_10px_var(--primary)]">
                      ROOT
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-sm bg-[rgba(0,243,255,0.1)] border border-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                    <Database className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-mono font-bold group-hover:text-[var(--primary)] transition-colors line-clamp-1 tracking-wide uppercase text-white">{project.name}</h3>
                    <p className="text-[10px] font-mono text-[var(--primary)] opacity-60 uppercase tracking-widest mt-1">OWNER: {project.admin.name}</p>
                  </div>
                </div>
                
                <p className="text-slate-400 text-xs font-mono mb-6 flex-1 line-clamp-2 relative z-10">
                  {project.description || "NO DESCRIPTION PROVIDED."}
                </p>
                
                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--primary)] opacity-80 relative z-10">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 bg-[rgba(0,243,255,0.05)] px-2 py-1 rounded-sm border border-[rgba(0,243,255,0.1)]"><LayoutList className="w-3.5 h-3.5" /> {project._count.tasks}</span>
                    <span className="flex items-center gap-1.5 bg-[rgba(0,243,255,0.05)] px-2 py-1 rounded-sm border border-[rgba(0,243,255,0.1)]"><Users className="w-3.5 h-3.5" /> {project._count.members}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-8 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]"></div>
            
            <h2 className="text-lg font-mono font-bold mb-6 tracking-widest uppercase text-[var(--primary)] flex items-center gap-2">
              <Plus className="w-5 h-5" /> Initialize New Node
            </h2>
            
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Node Designation</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.G. PROJECT_APOLLO"
                  className="uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Parameters (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] resize-none"
                  placeholder="Enter initialization parameters..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary"
                >
                  {creating ? "INITIALIZING..." : "EXECUTE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
