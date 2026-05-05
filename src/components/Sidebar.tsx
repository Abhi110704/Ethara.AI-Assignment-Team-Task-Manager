"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Cpu, Database, Network } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "SYS_DIAGNOSTICS", icon: Cpu },
    { href: "/projects", label: "DATA_NODES", icon: Database },
  ];

  return (
    <aside className="w-64 bg-[rgba(3,7,18,0.95)] backdrop-blur-xl border-r border-[var(--border)] flex-col hidden md:flex relative z-50">
      {/* Glow line on the right */}
      <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--primary)] to-transparent opacity-50 pointer-events-none"></div>
      
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-transparent border border-[var(--primary)] flex items-center justify-center relative overflow-hidden shadow-[0_0_10px_rgba(0,243,255,0.2)]">
            <div className="absolute inset-0 bg-[var(--primary)] opacity-10 animate-pulse-glow"></div>
            <Terminal className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <span className="font-mono font-bold text-sm tracking-widest text-[var(--foreground)]">ETHARA.OS</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2 flex flex-col gap-2">
        <p className="text-[0.65rem] font-mono text-[var(--primary)] opacity-50 px-3 mb-4 tracking-widest uppercase">Modules</p>
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-sm transition-all font-mono text-xs tracking-wider border ${
                isActive 
                  ? "bg-[rgba(0,243,255,0.05)] text-[var(--primary)] border-[var(--border-highlight)] shadow-[inset_4px_0_0_var(--primary)]" 
                  : "text-slate-400 border-transparent hover:text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : ''}`} />
              {link.label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_5px_var(--primary)] animate-pulse"></span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border)] mt-auto bg-[rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-1.5 p-3 border border-[var(--primary)] bg-[rgba(0,243,255,0.02)] rounded-sm shadow-[0_0_15px_rgba(0,243,255,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <span className="font-mono text-[8px] text-[var(--primary)] opacity-70 tracking-widest uppercase">System Architect</span>
          <span className="font-mono text-xs font-bold text-white tracking-wider group-hover:text-[var(--primary)] transition-colors">Abhiyanshu Anand</span>
          <span className="font-mono text-[9px] text-[var(--primary)] opacity-50 tracking-widest border-t border-[rgba(0,243,255,0.1)] pt-1 mt-1">ID: 2200911530008</span>
        </div>
      </div>
    </aside>
  );
}
