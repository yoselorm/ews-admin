import { useState, useEffect } from "react";

const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>

    {/* Accent glow blobs */}
    <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)" }} />
    <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(234,179,8,0.04) 0%, transparent 70%)" }} />
  </div>
);

const CornerBracket = ({ position }) => {
  const base = "absolute w-5 h-5 border-yellow-500";
  const corners = {
    tl: `top-0 left-0 border-t-2 border-l-2 ${base}`,
    tr: `top-0 right-0 border-t-2 border-r-2 ${base}`,
    bl: `bottom-0 left-0 border-b-2 border-l-2 ${base}`,
    br: `bottom-0 right-0 border-b-2 border-r-2 ${base}`,
  };
  return <div className={corners[position]} />;
};

const LPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden font-mono">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { font-family: 'IBM Plex Mono', monospace; }
        .display-font { font-family: 'Bebas Neue', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0%   { top: -8%; }
          100% { top: 108%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fade-up { opacity: 0; animation: fadeUp 0.6s ease forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.35s; }
        .delay-4 { animation-delay: 0.5s; }
        .delay-5 { animation-delay: 0.65s; }

        .scanline {
          position: absolute; left: 0; width: 100%;
          height: 8%; pointer-events: none;
          background: linear-gradient(to bottom, transparent, rgba(234,179,8,0.03), transparent);
          animation: scanline 6s linear infinite;
        }
        .cursor { display: inline-block; animation: blink 1s step-end infinite; }
        .spinner { animation: spin 0.8s linear infinite; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #111 inset;
          -webkit-text-fill-color: #e5e5e5;
          caret-color: #e5e5e5;
        }
      `}</style>

      <GridBackground />
      <div className="scanline" />

      {/* Left decoration bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-yellow-500 to-transparent opacity-30" />
      {/* Right decoration bar */}
      <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-yellow-500 to-transparent opacity-20" />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Card border */}
        <div className="relative border border-white/10 bg-[#111111] p-10"
          style={{ boxShadow: "0 0 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

          <CornerBracket position="tl" />
          <CornerBracket position="tr" />
          <CornerBracket position="bl" />
          <CornerBracket position="br" />

          {/* Header */}
          <div className="mb-10 fade-up delay-1">
            <div className="flex items-center gap-3 mb-6">
              {/* Logo mark */}
              <div className="relative w-9 h-9 flex items-center justify-center border border-yellow-500/60"
                style={{ boxShadow: "0 0 12px rgba(234,179,8,0.15)" }}>
                <div className="w-3 h-3 bg-yellow-500" />
                <div className="absolute inset-0 border border-yellow-500/20 scale-110" />
              </div>
              <div>
                <p className="text-[10px] text-yellow-500/70 tracking-[0.25em] uppercase">System</p>
                <p className="text-white/80 text-sm tracking-widest uppercase">Control Panel</p>
              </div>
            </div>

            <h1 className="display-font text-5xl text-white tracking-wider leading-none">
              ADMIN<br />
              <span className="text-yellow-500">ACCESS</span>
            </h1>
            <p className="text-white/30 text-[11px] mt-3 tracking-widest">
              AUTHENTICATED PERSONNEL ONLY<span className="cursor ml-0.5">_</span>
            </p>
          </div>

          {/* Status strip */}
          <div className="flex items-center gap-2 mb-8 fade-up delay-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400"
              style={{ boxShadow: "0 0 6px rgba(74,222,128,0.8)" }} />
            <span className="text-green-400/70 text-[10px] tracking-[0.2em] uppercase">
              Secure connection established
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-green-400/20 to-transparent" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="fade-up delay-3">
              <label className="block text-[10px] text-white/40 tracking-[0.2em] uppercase mb-2">
                Email Address
              </label>
              <div className={`relative border transition-all duration-200 ${
                focusedField === "email"
                  ? "border-yellow-500/60 bg-white/[0.04]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
                style={focusedField === "email" ? { boxShadow: "0 0 20px rgba(234,179,8,0.08)" } : {}}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={focusedField === "email" ? "#eab308" : "rgba(255,255,255,0.25)"}
                    strokeWidth="1.5">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="admin@example.com"
                  className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-white/90 placeholder-white/20 outline-none tracking-wide"
                />
                {/* Active indicator line */}
                <div className={`absolute bottom-0 left-0 h-[1px] bg-yellow-500 transition-all duration-300 ${
                  focusedField === "email" ? "w-full" : "w-0"
                }`} />
              </div>
            </div>

            {/* Password */}
            <div className="fade-up delay-4">
              <label className="block text-[10px] text-white/40 tracking-[0.2em] uppercase mb-2">
                Password
              </label>
              <div className={`relative border transition-all duration-200 ${
                focusedField === "password"
                  ? "border-yellow-500/60 bg-white/[0.04]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
                style={focusedField === "password" ? { boxShadow: "0 0 20px rgba(234,179,8,0.08)" } : {}}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={focusedField === "password" ? "#eab308" : "rgba(255,255,255,0.25)"}
                    strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent pl-10 pr-12 py-3.5 text-sm text-white/90 placeholder-white/20 outline-none tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-yellow-500/70 transition-colors">
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
                <div className={`absolute bottom-0 left-0 h-[1px] bg-yellow-500 transition-all duration-300 ${
                  focusedField === "password" ? "w-full" : "w-0"
                }`} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400/80 text-[11px] tracking-wide">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1 fade-up delay-4">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative w-3.5 h-3.5 border border-white/20 group-hover:border-yellow-500/50 transition-colors">
                  <input type="checkbox" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <span className="text-[11px] text-white/30 group-hover:text-white/50 tracking-wider transition-colors">
                  Remember me
                </span>
              </label>
              <button type="button"
                className="text-[11px] text-yellow-500/50 hover:text-yellow-500 tracking-wider transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <div className="fade-up delay-5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 text-sm font-medium tracking-[0.2em] uppercase overflow-hidden transition-all duration-200 disabled:opacity-70"
                style={{
                  background: loading ? "rgba(234,179,8,0.15)" : "#eab308",
                  color: loading ? "#eab308" : "#0a0a0a",
                  boxShadow: loading ? "none" : "0 0 30px rgba(234,179,8,0.25)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.boxShadow = "0 0 40px rgba(234,179,8,0.45)";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.boxShadow = "0 0 30px rgba(234,179,8,0.25)";
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#eab308" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Authenticate
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 fade-up delay-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/20 tracking-widest">
                v2.4.1 — SECURE
              </span>
              <span className="text-[10px] text-white/20 tracking-widest">
                © 2025
              </span>
            </div>
          </div>
        </div>

        {/* Bottom shadow line */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
        <div className="h-px mt-0.5 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent" />
      </div>
    </div>
  );
}

export default LPage;