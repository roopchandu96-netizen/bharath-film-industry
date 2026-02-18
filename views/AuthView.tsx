
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { syncUserToFirestore } from '../services/userService';
import { Loader2, AlertCircle, ShieldCheck, User, Mail, Lock, Briefcase, PlaySquare, ChevronRight, Inbox, ArrowLeft, Key } from 'lucide-react';
import { UserRole } from '../types';

const BFILogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#facc15" />
        <stop offset="30%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="80%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="blueGradAuth" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <filter id="glowAuth">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <path d="M100,20 C80,20 70,35 60,50 C45,50 45,65 45,85 L45,145 L55,145 L55,85 C55,75 60,65 75,65 C85,65 90,50 100,50 C110,50 115,65 125,65 C140,65 145,75 145,85 L145,145 L155,145 L155,85 C155,65 155,50 140,50 C130,35 120,20 100,20 Z" fill="url(#goldGradAuth)" filter="url(#glowAuth)" />
    <path d="M100,45 C85,45 78,55 70,65 C60,65 60,75 60,90 L60,145 L140,145 L140,90 C140,75 140,65 130,65 C122,55 115,45 100,45 Z" fill="url(#blueGradAuth)" />

    <g transform="translate(82, 95) scale(0.7)">
      <path d="M25,0 C35,15 50,20 50,35 C50,45 40,50 25,50 C10,50 0,45 0,35 C0,20 15,15 25,0" fill="none" stroke="url(#goldGradAuth)" strokeWidth="2" />
      <path d="M25,15 C30,22 35,25 35,35 C35,42 30,45 25,45 C20,45 15,42 15,35 C15,25 20,22 25,15 Z" fill="url(#goldGradAuth)" />
    </g>

    <text x="100" y="195" textAnchor="middle" fill="url(#goldGradAuth)" style={{ fontSize: '56px', fontWeight: '900', fontFamily: 'serif' }}>BFI</text>
    <text x="100" y="220" textAnchor="middle" fill="url(#goldGradAuth)" style={{ fontSize: '10px', fontWeight: '800', fontFamily: 'sans-serif', letterSpacing: '4px', textTransform: 'uppercase' }}>Bharath Film Industry</text>
    <path d="M20,205 L180,205" stroke="url(#goldGradAuth)" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.INVESTOR);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const isUnmountedRef = React.useRef(false);

  // New OTP State
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');

  React.useEffect(() => {
    isUnmountedRef.current = false;
    const checkHash = () => {
      if (window.location.hash === '#/admin') {
        setShowAdminLogin(true);
        // If Admin, default to login view and Admin Role
        setIsLogin(true);
        setSelectedRole(UserRole.ADMIN);
      } else {
        setShowAdminLogin(false);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => {
      window.removeEventListener('hashchange', checkHash);
      isUnmountedRef.current = true;
    };
  }, []);

  const startAuthFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Strict Admin Gatekeeper
      if (showAdminLogin) {
        if (email.toLowerCase() !== 'bharathfilmindustry@gmail.com') {
          throw new Error("Access Denied: Unrecognized Command ID.");
        }
      }

      if (isLogin) {
        await auth.signIn(email.trim(), password);
      } else {
        await auth.signUp(email.trim(), password, selectedRole, name);
        setIsVerifyingOtp(true);
      }
    } catch (err: any) {
      setError(err.message || "BFI Security Handshake Failed.");
    } finally {
      if (!isUnmountedRef.current) setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.verifyOtp(email.trim(), otp);

      // Auto-login success handling effectively handled by onAuthStateChange in App.tsx
      // But we can reset local state
      alert("Verification Successful. Initializing Session...");
      window.location.reload(); // Force reload to trigger fresh session check

    } catch (err: any) {
      setError(err.message || "Invalid or Expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (isVerifyingOtp) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-12 text-center text-white">
        <div className="space-y-6">
          <div className="w-24 h-24 rounded-[2.5rem] bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 mx-auto">
            <Lock size={48} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-white">Security Verification</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-2">
              Enter the 6-digit code sent to <span className="text-yellow-400">{email}</span>
            </p>
          </div>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] uppercase font-bold text-center">{error}</div>}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <input
            type="text"
            placeholder="000 000"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-6 text-center text-3xl font-mono text-yellow-400 focus:border-yellow-400 outline-none tracking-[0.5em]"
          />

          <button
            disabled={loading}
            type="submit"
            className="w-full py-6 rounded-3xl bg-yellow-400 text-black font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Activate Account'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsVerifyingOtp(false);
            setIsLogin(true);
          }}
          className="text-[9px] text-zinc-600 uppercase font-black tracking-widest hover:text-white transition-colors"
        >
          Resend Code or Change Email
        </button>
      </div>
    </div>
  );

  if (isForgotPassword) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-10 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <BFILogo className="w-48 h-48 logo-glow" />
        </div>

        <div className="bg-zinc-950 border border-yellow-400/10 rounded-[3.5rem] p-10 space-y-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => { setIsForgotPassword(false); setResetSent(false); setError(null); }} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-serif text-white">Reset Access Key</h2>
          </div>

          {resetSent ? (
            <div className="space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mx-auto">
                <ShieldCheck size={32} />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed uppercase font-black tracking-widest">
                A secure reset link has been dispatched to <span className="text-yellow-400">{email}</span>.
              </p>
              <button onClick={() => setIsForgotPassword(false)} className="w-full py-4 bg-zinc-900 border border-zinc-800 text-yellow-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-zinc-800 transition-all">
                Return to Entry Node
              </button>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-relaxed">
                Provide your institutional email to initiate a security credential reset.
              </p>
              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] uppercase font-bold text-center">{error}</div>}
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                  <input type="email" placeholder="Institutional Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 text-sm text-white focus:border-yellow-400 outline-none" />
                </div>
                <button disabled={loading} type="submit" className="w-full py-6 bg-yellow-400 text-black font-black uppercase text-xs tracking-widest rounded-3xl shadow-xl active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Get Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (showAdminLogin && !isForgotPassword) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Admin Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black opacity-50 pointer-events-none" />
      <div className="absolute inset-0 grid-floor opacity-20 pointer-events-none" />

      <div className="w-full max-w-sm space-y-10 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 rounded-full border-2 border-red-500/30 flex items-center justify-center bg-red-500/10 shadow-[0_0_50px_rgba(220,38,38,0.3)] mb-6 animate-pulse">
            <ShieldCheck size={48} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-serif text-white tracking-wider text-center">BFI COMMAND</h1>
          <p className="text-[10px] text-red-500 uppercase font-bold tracking-[0.3em] mt-2">Restricted Access Level 5</p>
        </div>

        <div className="bg-zinc-950 border border-red-500/20 rounded-[2rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
          {/* Scan Line Animation */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_10px_#ef4444] animate-[scan_3s_linear_infinite]" />

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] uppercase font-bold text-center animate-pulse">{error}</div>}

          <form onSubmit={startAuthFlow} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="Commander ID"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-14 text-sm text-white focus:border-red-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="Security Token"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-14 text-sm text-white focus:border-red-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <><Key size={16} /> Authenticate Node</>}
            </button>
          </form>

          <div className="text-center">
            <button onClick={() => { window.location.hash = ''; setShowAdminLogin(false); }} className="text-[9px] text-zinc-600 hover:text-white uppercase tracking-widest transition-colors">
              Return to Public Gateway
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-10 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <BFILogo className="w-48 h-48 logo-glow" />
        </div>

        <div className="bg-zinc-950 border border-yellow-400/10 rounded-[3.5rem] p-10 space-y-8 shadow-2xl">
          <h2 className="text-2xl font-serif text-white text-center">{isLogin ? 'Member Sign In' : 'Institutional Registry'}</h2>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] uppercase font-bold text-center">{error}</div>}

          <form onSubmit={startAuthFlow} className="space-y-6">
            {!isLogin && (
              <div className="space-y-6">
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                  <input type="text" placeholder="Full Legal Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 text-sm text-white focus:border-yellow-400 outline-none" />
                </div>
                <div className={`grid ${showAdminLogin ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                  <button type="button" onClick={() => setSelectedRole(UserRole.INVESTOR)} className={`p-6 rounded-[2rem] border transition-all ${selectedRole === UserRole.INVESTOR ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}>
                    <Briefcase size={24} className="mx-auto mb-2" />
                    <span className="text-[9px] font-black uppercase">Investor</span>
                  </button>
                  <button type="button" onClick={() => setSelectedRole(UserRole.DIRECTOR)} className={`p-6 rounded-[2rem] border transition-all ${selectedRole === UserRole.DIRECTOR ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}>
                    <PlaySquare size={24} className="mx-auto mb-2" />
                    <span className="text-[9px] font-black uppercase">Director</span>
                  </button>
                  {showAdminLogin && (
                    <button type="button" onClick={() => setSelectedRole(UserRole.ADMIN)} className={`p-6 rounded-[2rem] border transition-all ${selectedRole === UserRole.ADMIN ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}>
                      <ShieldCheck size={24} className="mx-auto mb-2" />
                      <span className="text-[9px] font-black uppercase">Admin</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
              <input type="email" placeholder="Institutional Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 text-sm text-white focus:border-yellow-400 outline-none" />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                <input type="password" placeholder="Master Access Key" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 text-sm text-white focus:border-yellow-400 outline-none" />
              </div>
              {isLogin && (
                <div className="text-right px-1">
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                    className="text-[9px] text-zinc-600 uppercase font-black tracking-widest hover:text-yellow-400 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <button disabled={loading} type="submit" className="w-full py-6 bg-yellow-400 text-black font-black uppercase text-xs tracking-widest rounded-3xl shadow-xl active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : (isLogin ? 'Establish Session' : 'Request Security Node')}
            </button>
          </form>
          <button onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); setError(null); }} className="w-full text-[10px] text-zinc-600 uppercase font-black tracking-widest text-center hover:text-yellow-400 transition-colors">
            {isLogin ? "No Access? Join Circuit" : "Existing Member? Authenticate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
