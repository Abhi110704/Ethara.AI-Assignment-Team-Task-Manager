"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, AlertTriangle, Terminal } from "lucide-react";

type DashboardMetrics = {
  totalTasks: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
  tasksPerUser: Record<string, number>;
  overdueTasks: number;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-xs text-[var(--primary)] animate-pulse tracking-widest">FETCHING SYS_DIAGNOSTICS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-[var(--border)] pb-4 mb-8 relative">
        <div className="absolute -bottom-px left-0 w-1/3 h-px bg-gradient-to-r from-[var(--primary)] to-transparent"></div>
        <h1 className="text-2xl font-mono font-bold mb-1 tracking-wider uppercase text-[var(--primary)]">System Diagnostics</h1>
        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Real-time task load metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="SYS_TOTAL_LOAD" 
          value={metrics?.totalTasks || 0} 
          icon={<Terminal className="text-[var(--primary)]" />} 
          trend="TOTAL TASKS"
        />
        <StatCard 
          title="ACTIVE_PROCESSES" 
          value={metrics?.tasksByStatus.IN_PROGRESS || 0} 
          icon={<Activity className="text-[var(--warning)]" />} 
          trend="IN PROGRESS"
        />
        <StatCard 
          title="COMPLETED_CYCLES" 
          value={metrics?.tasksByStatus.DONE || 0} 
          icon={<Activity className="text-[var(--success)]" />} 
          trend="DONE"
        />
        <StatCard 
          title="CRITICAL_ERRORS" 
          value={metrics?.overdueTasks || 0} 
          icon={<AlertTriangle className="text-[var(--danger)]" />} 
          trend="OVERDUE TASKS"
          isDanger={(metrics?.overdueTasks || 0) > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-mono font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-[var(--primary)]">
            <span className="w-2 h-2 bg-[var(--primary)] shadow-[0_0_5px_var(--primary)]"></span>
            Status Allocation
          </h2>
          <div className="space-y-6">
            <ProgressBar label="IDLE (TODO)" value={metrics?.tasksByStatus.TODO || 0} total={metrics?.totalTasks || 1} color="bg-slate-400" />
            <ProgressBar label="PROCESSING (IN_PROGRESS)" value={metrics?.tasksByStatus.IN_PROGRESS || 0} total={metrics?.totalTasks || 1} color="bg-[var(--warning)]" />
            <ProgressBar label="OPTIMIZED (DONE)" value={metrics?.tasksByStatus.DONE || 0} total={metrics?.totalTasks || 1} color="bg-[var(--success)]" />
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-mono font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-[var(--primary)]">
            <span className="w-2 h-2 bg-[var(--primary)] shadow-[0_0_5px_var(--primary)]"></span>
            Node Distribution
          </h2>
          {metrics && Object.keys(metrics.tasksPerUser).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(metrics.tasksPerUser).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-sm bg-[rgba(0,243,255,0.05)] border border-[var(--border)] group hover:border-[var(--border-highlight)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-[rgba(0,243,255,0.1)] border border-[var(--primary)] flex items-center justify-center text-xs font-mono font-bold text-[var(--primary)]">
                      {name.charAt(0)}
                    </div>
                    <span className="font-mono text-sm tracking-wide uppercase">{name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-[var(--primary)] opacity-50">LOAD:</span>
                    <span className="font-bold text-[var(--primary)] text-lg">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 font-mono text-xs tracking-widest text-slate-500 uppercase">
              NO NODES ASSIGNED
            </div>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-sm font-mono font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-[var(--accent)]">
          <span className="w-2 h-2 bg-[var(--accent)] shadow-[0_0_5px_var(--accent)]"></span>
          Ethara.OS Field Manual (Role Capabilities)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-slate-300 leading-relaxed uppercase tracking-wider">
          <div className="p-4 bg-[rgba(255,0,85,0.05)] border border-[rgba(255,0,85,0.2)]">
            <h3 className="text-[var(--danger)] font-bold mb-3 flex items-center gap-2"><Terminal className="w-4 h-4"/> ROOT ADMIN</h3>
            <ul className="space-y-2 ml-6 list-disc text-[10px]">
              <li>Initialize new Data Nodes (Projects)</li>
              <li>Grant Node Access (Add Members)</li>
              <li>Execute Task Initialization & Parameter Editing</li>
              <li>Purge Nodes & Tasks</li>
            </ul>
          </div>
          <div className="p-4 bg-[rgba(0,243,255,0.05)] border border-[rgba(0,243,255,0.2)]">
            <h3 className="text-[var(--primary)] font-bold mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> FIELD OPERATOR</h3>
            <ul className="space-y-2 ml-6 list-disc text-[10px]">
              <li>Access assigned Data Nodes</li>
              <li>Monitor live Kanban telemetry</li>
              <li>Update task processing status via dropdown overrides</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-[rgba(176,38,255,0.05)] border border-[var(--accent)] flex items-center gap-2 text-[10px] text-[var(--accent)] shadow-[inset_0_0_10px_rgba(176,38,255,0.1)]">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span>TEST INSTRUCTIONS: LOG IN AS <strong>ADMIN@ETHARA.AI</strong> TO EDIT INFRASTRUCTURE. LOG IN AS <strong>USER@ETHARA.AI</strong> TO VERIFY RESTRICTED ACCESS.</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, isDanger }: any) {
  return (
    <div className={`card overflow-hidden group ${isDanger ? 'border-[var(--danger)] shadow-[0_0_15px_rgba(255,0,85,0.2)]' : ''}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className={`text-[10px] font-mono mb-2 uppercase tracking-widest ${isDanger ? 'text-[var(--danger)]' : 'text-[var(--primary)] opacity-70'}`}>{title}</p>
          <h3 className="text-4xl font-mono font-bold text-white">{value}</h3>
        </div>
        <div className={`p-2 bg-[rgba(0,0,0,0.5)] rounded-sm border ${isDanger ? 'border-[var(--danger)]' : 'border-[var(--border)]'}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-slate-800"></div>
        <p className={`text-[9px] font-mono uppercase tracking-widest ${isDanger ? 'text-[var(--danger)]' : 'text-slate-500'}`}>{trend}</p>
      </div>
      
      {isDanger && (
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[var(--danger)] rounded-full mix-blend-screen filter blur-[40px] opacity-20 animate-pulse"></div>
      )}
    </div>
  );
}

function ProgressBar({ label, value, total, color }: any) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between font-mono text-xs mb-2 uppercase tracking-widest">
        <span className="text-[var(--primary)] opacity-90">{label}</span>
        <span className="text-white">[{value}] <span className="text-slate-500">{percentage}%</span></span>
      </div>
      <div className="w-full bg-[rgba(0,0,0,0.5)] border border-[var(--border)] h-3 p-[1px]">
        <div className={`${color} h-full transition-all duration-1000 ease-out relative`} style={{ width: `${percentage}%` }}>
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-white opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
