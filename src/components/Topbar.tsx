"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Activity, RadioReceiver } from "lucide-react";
import { useEffect, useState } from "react";

export function Topbar() {
  const { data: session } = useSession();
  const [time, setTime] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[rgba(3,7,18,0.85)] backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Decorative sys status */}
        <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-[var(--primary)] border border-[var(--border)] px-3 py-1 bg-[rgba(0,243,255,0.05)]">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>STATUS: ONLINE</span>
        </div>
        <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-slate-400 border border-[var(--border)] px-3 py-1">
          <span>{time}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setShowNotification(true)}
          className="p-2 text-[var(--primary)] hover:bg-[rgba(0,243,255,0.1)] border border-transparent hover:border-[var(--border)] transition-all relative rounded-sm"
          title="Communications"
        >
          <RadioReceiver className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--accent)] rounded-full shadow-[0_0_5px_var(--accent)] animate-pulse"></span>
        </button>
        
        <div className="h-6 w-px bg-[var(--border)] mx-1"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[rgba(0,243,255,0.1)] border border-[var(--primary)] flex items-center justify-center text-xs font-mono font-bold text-[var(--primary)] shadow-[0_0_10px_rgba(0,243,255,0.2)]">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:block text-xs font-mono">
            <p className="font-bold text-[var(--foreground)] tracking-wide uppercase">{session?.user?.name}</p>
            <p className="text-[var(--primary)] opacity-70 text-[10px] uppercase">{session?.user?.email}</p>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 ml-2 text-[var(--danger)] hover:bg-[rgba(255,0,85,0.1)] border border-transparent hover:border-[var(--danger)] transition-all rounded-sm"
            title="Terminate Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-sm p-6 border border-[var(--primary)] shadow-[0_0_30px_rgba(0,243,255,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-[rgba(0,243,255,0.1)] border border-[var(--primary)] flex items-center justify-center">
                <RadioReceiver className="w-4 h-4 text-[var(--primary)] animate-pulse" />
              </div>
              <h3 className="font-mono text-sm font-bold tracking-widest uppercase text-[var(--primary)]">Incoming Comm Link</h3>
            </div>
            
            <p className="font-mono text-xs text-slate-300 leading-relaxed mb-6 uppercase tracking-wider">
              ETHARA.OS: No active communications found in the current session. Please ensure your comm channel is open and encrypted.
            </p>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowNotification(false)}
                className="btn btn-primary text-xs py-2 px-4"
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
