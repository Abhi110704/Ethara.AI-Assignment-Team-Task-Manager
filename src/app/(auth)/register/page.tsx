"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(`ERR_CODE_${res.status}: ${data.message || "REGISTRATION FAILED"}`);
      }
    } catch (err) {
      setError("SYS_ERR: UNEXPECTED FAILURE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 relative overflow-hidden">
      <div className="radar"></div>

      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="glass-panel w-full max-w-md animate-fade-in relative z-10 p-8 border border-[rgba(0,243,255,0.3)] shadow-[0_0_40px_rgba(0,243,255,0.15)] group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent shadow-[0_0_15px_var(--primary)]"></div>
        <div className="absolute bottom-0 right-0 w-16 h-1 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)] transition-all duration-1000 group-hover:w-full"></div>

        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 mb-4 bg-[rgba(0,243,255,0.05)] border border-[var(--primary)] flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(0,243,255,0.2)] group-hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all">
            <div className="absolute inset-0 bg-[var(--primary)] opacity-20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-[var(--primary)] animate-scan"></div>
            <ShieldAlert className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-xl font-mono font-bold mb-2 tracking-widest text-[var(--primary)] uppercase">Identity Provisioning</h1>
          <p className="text-[var(--primary)] opacity-50 font-mono text-xs border border-[var(--primary)] px-3 py-1 bg-[rgba(0,243,255,0.05)]">Register new operator identity</p>
        </div>

        {error && (
          <div className="bg-[rgba(255,0,85,0.1)] border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-sm mb-6 text-xs font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-[var(--danger)] rounded-full animate-pulse"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Operator Designation</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-[var(--primary)] opacity-50" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 uppercase"
                placeholder="JOHN DOE"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Comm Link (Email)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[var(--primary)] opacity-50" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 uppercase"
                placeholder="OPERATOR@ETHARA.AI"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono mb-2 text-[var(--primary)] opacity-80 uppercase tracking-widest">Security Passcode</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[var(--primary)] opacity-50" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 mt-4"
          >
            {loading ? "PROVISIONING..." : "PROVISION IDENTITY"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-mono text-[var(--primary)] opacity-60">
          IDENTITY ALREADY PROVISIONED?{" "}
          <Link href="/login" className="text-[var(--primary)] hover:text-white hover:shadow-[0_0_10px_var(--primary)] transition-all ml-2 underline underline-offset-4">
            INITIATE LOGIN
          </Link>
        </p>
      </div>
    </div>
  );
}
