"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Users, UserPlus, Calendar, Clock, CheckCircle2, Trash2, ArrowLeft, Terminal } from "lucide-react";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedToId: string;
  assignedTo: { id: string; name: string } | null;
};

type Project = {
  id: string;
  name: string;
  description: string;
  adminId: string;
  admin: { id: string; name: string; email: string };
  members: { user: { id: string; name: string; email: string } }[];
  tasks: Task[];
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  // Task Form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskStatus, setTaskStatus] = useState("TODO");
  const [taskDue, setTaskDue] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Member Form
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else if (res.status === 404 || res.status === 403) {
        router.push("/projects");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const isAdmin = session?.user?.id === project?.adminId;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError("");
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail }),
      });
      if (res.ok) {
        setShowMemberModal(false);
        setMemberEmail("");
        fetchProject();
      } else {
        const data = await res.json();
        setMemberError(data.message || "OPERATION FAILED");
      }
    } catch (error) {
      setMemberError("SYS_ERR: NETWORK FAILURE");
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      status: taskStatus,
      dueDate: taskDue || null,
      assignedToId: taskAssignee || null,
      projectId: id,
    };

    try {
      const url = editingTaskId ? `/api/tasks/${editingTaskId}` : "/api/tasks";
      const method = editingTaskId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        closeTaskModal();
        fetchProject();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("TERMINATE THIS PROCESS? ACTION CANNOT BE UNDONE.")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("CRITICAL WARNING: PURGE ENTIRE NODE AND ALL ASSOCIATED DATA?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/projects");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || "");
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDue(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
    setTaskAssignee(task.assignedToId || "");
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskDesc("");
    setTaskPriority("MEDIUM");
    setTaskStatus("TODO");
    setTaskDue("");
    setTaskAssignee("");
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-xs text-[var(--primary)] animate-pulse tracking-widest">ACCESSING NODE DATA...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { id: "TODO", title: "IDLE (TODO)", color: "border-slate-500", shadow: "rgba(148,163,184,0.2)" },
    { id: "IN_PROGRESS", title: "PROCESSING (ACTIVE)", color: "border-[var(--warning)]", shadow: "rgba(255,184,0,0.2)" },
    { id: "DONE", title: "OPTIMIZED (DONE)", color: "border-[var(--success)]", shadow: "rgba(0,255,136,0.2)" },
  ];

  const teamMembers = [{ user: project.admin }, ...project.members];

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in relative z-10">
      <div className="flex items-center gap-4 text-xs font-mono text-[var(--primary)] opacity-70 mb-2 tracking-widest uppercase">
        <Link href="/projects" className="hover:text-[var(--primary)] hover:opacity-100 flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> REVERT TO NODE LIST
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6 border border-[var(--border)] shadow-[0_0_20px_rgba(0,243,255,0.05)]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-5 h-5 text-[var(--primary)]" />
            <h1 className="text-2xl font-mono font-bold tracking-wider uppercase text-white">{project.name}</h1>
            <span className={`text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-widest ${
              isAdmin 
                ? "bg-[rgba(255,0,85,0.1)] text-[var(--danger)] border border-[var(--danger)] shadow-[0_0_5px_rgba(255,0,85,0.3)]" 
                : "bg-[rgba(0,243,255,0.1)] text-[var(--primary)] border border-[var(--primary)] shadow-[0_0_5px_rgba(0,243,255,0.3)]"
            }`}>
              {isAdmin ? "ROOT_ADMIN" : "FIELD_OPERATOR"}
            </span>
          </div>
          <p className="text-[var(--primary)] opacity-60 font-mono text-xs tracking-wider uppercase max-w-2xl">{project.description || "NO PARAMETERS SET."}</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {isAdmin && (
            <button onClick={() => setShowMemberModal(true)} className="btn btn-secondary gap-2 text-xs">
              <UserPlus className="w-4 h-4 text-[var(--primary)]" /> ADD OP
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary gap-2 text-xs">
              <Plus className="w-4 h-4" /> INIT TASK
            </button>
          )}
          {isAdmin && (
            <button onClick={handleDeleteProject} className="btn btn-danger gap-2 text-xs px-3 ml-2" title="PURGE NODE">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 mr-4">
          {teamMembers.map((m, i) => (
            <div key={i} className="w-8 h-8 border border-[var(--primary)] bg-[rgba(0,243,255,0.1)] flex items-center justify-center text-xs font-mono font-bold text-[var(--primary)] shadow-[0_0_5px_rgba(0,243,255,0.2)]" title={`${m.user.name} ${m.user.email === project.admin.email ? '(ROOT)' : ''}`}>
              {m.user.name.charAt(0)}
            </div>
          ))}
        </div>
        <span className="text-xs font-mono text-[var(--primary)] opacity-60 uppercase tracking-widest">ACTIVE OPERATORS: {teamMembers.length}</span>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-[500px]">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col h-full bg-[rgba(0,0,0,0.4)] border border-[var(--border)] overflow-hidden">
            <div className={`p-4 border-b border-[var(--border)] bg-[rgba(0,243,255,0.02)] border-t-2 ${col.color} flex justify-between items-center shadow-[0_4px_10px_${col.shadow}]`}>
              <h3 className="font-mono text-xs font-bold tracking-widest uppercase text-white">{col.title}</h3>
              <span className="bg-[rgba(0,243,255,0.1)] text-[var(--primary)] text-[10px] font-mono py-1 px-2 border border-[var(--primary)]">
                {project.tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {project.tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task.id} 
                  className={`card p-4 group bg-[rgba(3,7,18,0.9)] ${isAdmin ? 'hover:border-[var(--primary)] cursor-pointer' : ''}`}
                  onClick={() => isAdmin && openEditTask(task)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 ${
                      task.priority === 'HIGH' ? 'bg-[rgba(255,0,85,0.1)] text-[var(--danger)] border border-[var(--danger)] shadow-[0_0_5px_rgba(255,0,85,0.3)]' : 
                      task.priority === 'MEDIUM' ? 'bg-[rgba(255,184,0,0.1)] text-[var(--warning)] border border-[var(--warning)] shadow-[0_0_5px_rgba(255,184,0,0.3)]' : 
                      'bg-[rgba(0,255,136,0.1)] text-[var(--success)] border border-[var(--success)] shadow-[0_0_5px_rgba(0,255,136,0.3)]'
                    }`}>
                      PRIORITY:{task.priority}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        className="bg-[rgba(0,0,0,0.8)] border border-[var(--border)] text-[9px] p-1 uppercase font-mono text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                        value={task.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => updateTaskStatus(task.id, e.target.value)}
                      >
                        <option value="TODO">IDLE</option>
                        <option value="IN_PROGRESS">ACTIVE</option>
                        <option value="DONE">DONE</option>
                      </select>
                      
                      {isAdmin && (
                        <button 
                          className="text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[rgba(255,0,85,0.1)] border border-transparent hover:border-[var(--danger)]"
                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-mono text-sm font-bold text-white mb-3 tracking-wide leading-relaxed">{task.title}</h4>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] text-[10px] font-mono text-[var(--primary)] opacity-70">
                    <div className="flex items-center gap-1.5 uppercase" title="Due Date">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "NO_DATE"}
                    </div>
                    
                    {task.assignedTo ? (
                      <div className="flex items-center gap-1.5 uppercase tracking-widest" title={`Assigned to ${task.assignedTo.name}`}>
                        <div className="w-4 h-4 bg-[var(--primary)] text-black flex items-center justify-center text-[8px] font-bold shadow-[0_0_5px_var(--primary)]">
                          {task.assignedTo.name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[60px]">{task.assignedTo.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="uppercase opacity-50">UNASSIGNED</span>
                    )}
                  </div>
                </div>
              ))}
              
              {project.tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="h-24 border border-dashed border-[var(--border)] flex items-center justify-center text-[var(--primary)] opacity-40 font-mono text-[10px] tracking-widest uppercase bg-[rgba(0,243,255,0.02)]">
                  NO TASKS FOUND
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-8 border border-[var(--primary)] shadow-[0_0_30px_rgba(0,243,255,0.1)] max-h-[90vh] overflow-y-auto relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]"></div>
            
            <h2 className="text-lg font-mono font-bold mb-6 tracking-widest uppercase text-[var(--primary)] flex items-center gap-2">
              <Terminal className="w-5 h-5" /> {editingTaskId ? "EDIT TASK PARAMETERS" : "INITIALIZE NEW TASK"}
            </h2>
            
            <form onSubmit={handleSaveTask} className="space-y-5">
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Designation *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Log Data</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full min-h-[80px] resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Priority</label>
                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="w-full">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH_CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Status</label>
                  <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} className="w-full">
                    <option value="TODO">IDLE</option>
                    <option value="IN_PROGRESS">ACTIVE</option>
                    <option value="DONE">OPTIMIZED</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Target Date</label>
                  <input
                    type="date"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Assign Operator</label>
                  <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className="w-full">
                    <option value="">UNASSIGNED</option>
                    {teamMembers.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
                <button type="button" onClick={closeTaskModal} className="btn btn-secondary">
                  ABORT
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTaskId ? "SAVE PARAMETERS" : "EXECUTE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-8 border border-[var(--accent)] shadow-[0_0_30px_rgba(176,38,255,0.1)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"></div>
            
            <h2 className="text-lg font-mono font-bold mb-6 tracking-widest uppercase text-[var(--accent)] flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> GRANT NODE ACCESS
            </h2>
            {memberError && <div className="text-[var(--danger)] text-xs font-mono mb-4 bg-[rgba(255,0,85,0.1)] border border-[var(--danger)] p-3 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--danger)] rounded-full animate-pulse"></div>
              {memberError}
            </div>}
            
            <form onSubmit={handleAddMember} className="space-y-5">
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--accent)] opacity-80 uppercase tracking-widest">Operator Comm Link</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full border-[var(--accent)] focus:border-[var(--accent)] text-[var(--accent)] focus:shadow-[inset_0_0_10px_rgba(176,38,255,0.1),_0_0_10px_rgba(176,38,255,0.4)]"
                  placeholder="OPERATOR@ETHARA.AI"
                  style={{ color: 'var(--accent)' }}
                />
                <p className="text-[10px] font-mono text-[var(--accent)] opacity-50 mt-2 uppercase tracking-widest">Op must exist in main registry.</p>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-[rgba(176,38,255,0.2)] mt-6">
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn btn-secondary hover:border-[var(--accent)]">
                  ABORT
                </button>
                <button type="submit" className="btn btn-primary" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', boxShadow: 'inset 0 0 10px rgba(176,38,255,0.1), 0 0 5px rgba(176,38,255,0.4)' }}>
                  GRANT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
