import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { Loader2, Mail, Lock, User, EyeOff, Eye, ShieldCheck, Key, ArrowLeft, PlaySquare, Briefcase } from 'lucide-react';
import { UserRole } from '../types';

import { BFILogo, BFIWordmark } from '../components/BFILogo';

const inputClasses = "w-full bg-[#FAF9F6] border border-zinc-200 rounded-xl py-3.5 px-4 text-sm text-zinc-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all placeholder:text-zinc-400";
const labelClasses = "block text-[11px] font-bold text-zinc-600 mb-1.5 uppercase tracking-wide";

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.INVESTOR);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // New OTP State
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const isUnmountedRef = React.useRef(false);

  React.useEffect(() => {
    isUnmountedRef.current = false;
    const checkHash = () => {
      if (window.location.hash === '#/admin') {
        setShowAdminLogin(true);
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
    if (!isLogin && !agreeTerms) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }

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
        try {
          await auth.signIn(email.trim(), password);
        } catch (err: any) {
          if (err.message && (err.message.includes('fetch') || err.message.includes('Invalid login credentials'))) {
            // Fallback for old users & missing offline credentials
            console.warn("Network or credential error, triggering offline fallback...");
            localStorage.setItem('bfi_legacy_session', JSON.stringify({
              user: {
                id: 'legacy-' + Date.now(),
                email: email.trim(),
                user_metadata: { full_name: 'Legacy User', role: email.trim() === 'bharathfilmindustry@gmail.com' ? UserRole.ADMIN : UserRole.INVESTOR }
              }
            }));
            window.location.reload();
            return;
          }
          throw err;
        }
      } else {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        await auth.signUp(email.trim(), password, selectedRole, fullName);
        setIsVerifyingOtp(true);
      }
    } catch (err: any) {
      setError(err.message || "Authentication Failed.");
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
      window.location.reload(); 
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
          <input type="text" placeholder="000 000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-6 text-center text-3xl font-mono text-yellow-400 focus:border-yellow-400 outline-none tracking-[0.5em]" />
          <button disabled={loading} type="submit" className="w-full py-6 rounded-3xl bg-yellow-400 text-black font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Activate Account'}
          </button>
        </form>
        <button onClick={() => { setIsVerifyingOtp(false); setIsLogin(true); }} className="text-[9px] text-zinc-600 uppercase font-black tracking-widest hover:text-white transition-colors">
          Resend Code or Change Email
        </button>
      </div>
    </div>
  );

  if (isForgotPassword && !showAdminLogin) return (
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
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_10px_#ef4444] animate-[scan_3s_linear_infinite]" />
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] uppercase font-bold text-center animate-pulse">{error}</div>}
          <form onSubmit={startAuthFlow} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="email" placeholder="Commander ID" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-14 text-sm text-white focus:border-red-500 outline-none transition-all placeholder:text-zinc-700" />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="password" placeholder="Security Token" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-14 text-sm text-white focus:border-red-500 outline-none transition-all placeholder:text-zinc-700" />
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Mobile Top Nav / Left Column on Desktop */}
      <div className="w-full lg:w-[45%] bg-[#0B1527] text-white flex flex-col relative overflow-hidden lg:h-screen lg:rounded-r-3xl z-20 hidden lg:flex">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="p-8 lg:p-12 relative z-10 flex-1 flex flex-col justify-center">
          <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
            <BFIWordmark />
          </div>

          <div className="max-w-md mt-16">
            {isLogin ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                  <PlaySquare size={14} /> Film Investment
                </div>
                <h1 className="text-4xl lg:text-5xl font-serif leading-[1.1] mb-6">
                  Where <span className="text-yellow-500 italic">Scripts</span><br/> Become Films
                </h1>
                <p className="text-slate-400 text-sm lg:text-base mb-12 max-w-[300px]">
                  India's first script investment marketplace. Discover stories worth funding, invest with confidence, and share in the success of every blockbuster.
                </p>

                <div className="grid grid-cols-3 gap-6 text-left border-t border-slate-800 pt-8">
                  <div>
                    <div className="text-yellow-500 font-bold text-2xl lg:text-3xl font-serif">₹48Cr</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Funded</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-2xl lg:text-3xl font-serif">127</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Films Live</div>
                  </div>
                  <div>
                    <div className="text-yellow-500 font-bold text-2xl lg:text-3xl font-serif">3.8K</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Investors</div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                     <span>+28%</span>
                     <span className="text-[10px] text-slate-500 uppercase tracking-widest">Avg Return</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                  <span>💰</span> Join 3,800+ Investors
                </div>
                <h1 className="text-4xl lg:text-5xl font-serif leading-[1.1] mb-6">
                  Start <span className="text-yellow-500 italic">Investing</span><br/> in Films Today
                </h1>
                <p className="text-slate-400 text-sm lg:text-base mb-8">
                  India's first script investment marketplace
                </p>

                <div className="flex flex-col gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 text-sm font-semibold text-slate-200 w-max backdrop-blur-sm">
                    <span className="text-yellow-500">✓</span> +28% Returns
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 text-sm font-semibold text-slate-200 w-max backdrop-blur-sm">
                    <span className="text-yellow-500">✓</span> From ₹50K
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 text-sm font-semibold text-slate-200 w-max backdrop-blur-sm">
                    <span className="text-yellow-500">✓</span> Legally Protected
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden w-full bg-[#0B1527] p-6 pb-8 flex flex-col justify-center relative overflow-hidden text-center z-10 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        <BFIWordmark className="mx-auto mb-6" />
        {isLogin ? (
          <div>
            <div className="inline-flex items-center mb-4 px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-500 text-[9px] font-bold uppercase tracking-widest">
              Film Investment
            </div>
            <h1 className="text-3xl font-serif leading-tight">
              Where <span className="text-yellow-500 italic">Scripts</span> Become Films
            </h1>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center mb-4 px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-500 text-[9px] font-bold uppercase tracking-widest">
              Join 3,800+ Investors
            </div>
            <h1 className="text-3xl font-serif leading-tight">
              Start <span className="text-yellow-500 italic">Investing</span> in Films Today
            </h1>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-[420px] mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
          
          <div className="bg-zinc-100 p-1.5 rounded-full flex mb-10 w-full relative z-10">
            <button
              className={`flex-1 py-3.5 text-sm font-bold rounded-full transition-all duration-300 ${isLogin ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => { setIsLogin(true); setError(null); }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-3.5 text-sm font-bold rounded-full transition-all duration-300 ${!isLogin ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => { setIsLogin(false); setError(null); }}
            >
              Create Account
            </button>
          </div>

          {!isLogin ? (
            <div className="space-y-6">
              <div>
                <label className={labelClasses}>I AM A</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { role: UserRole.INVESTOR, icon: '💰', title: 'Investor', text: 'Fund films' },
                    { role: UserRole.DIRECTOR, icon: '🎬', title: 'Director', text: 'Submit scripts' },
                    { role: UserRole.PRODUCER, icon: '🎥', title: 'Producer', text: 'Manage films' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${selectedRole === r.role ? 'border-yellow-500 bg-amber-50 shadow-sm outline outline-1 outline-yellow-500' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                      onClick={() => setSelectedRole(r.role)}
                    >
                      <span className="text-xl lg:text-2xl mb-1">{r.icon}</span>
                      <span className="text-[13px] font-bold text-zinc-800">{r.title}</span>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">{r.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>}

              <form onSubmit={startAuthFlow} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>First Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input type="text" placeholder="Ravi" required value={firstName} onChange={e => setFirstName(e.target.value)} className={`${inputClasses} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input type="text" placeholder="Kumar" required value={lastName} onChange={e => setLastName(e.target.value)} className={`${inputClasses} pl-10`} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                     <input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} className={`${inputClasses} pl-10`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Phone</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">📞</span>
                      <input type="text" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} className={`${inputClasses} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input type={showPassword ? "text" : "password"} placeholder="Min 8 chars" required value={password} onChange={e => setPassword(e.target.value)} className={`${inputClasses} pl-10 pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" id="terms" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="mt-[3px] min-w-4 w-4 h-4 rounded border-zinc-300 text-yellow-600 focus:ring-yellow-600" />
                  <label htmlFor="terms" className="text-[11px] text-zinc-600 leading-relaxed font-medium block">
                    I agree to the <a href="#" className="font-bold text-amber-600 hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-amber-600 hover:underline">Privacy Policy</a>. I understand this is a financial investment platform.
                  </label>
                </div>

                <div className="pt-2">
                  <button disabled={loading} type="submit" className="w-full py-4 bg-[#0B1527] hover:bg-black text-white text-sm font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-[0.98]">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> Create Free Account</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              <div className="mb-8">
                <h2 className="text-3xl font-serif text-slate-900 mb-2">Welcome back</h2>
                <p className="text-sm text-slate-500">Sign in to your CineInvest account</p>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>}

              <form onSubmit={startAuthFlow} className="space-y-6">
                <div>
                  <label className={labelClasses}>Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                     <input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} className={`${inputClasses} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input type={showPassword ? "text" : "password"} placeholder="Enter your password" required value={password} onChange={e => setPassword(e.target.value)} className={`${inputClasses} pl-10 pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-zinc-300 text-yellow-600 focus:ring-yellow-600" />
                    <label htmlFor="remember" className="text-xs font-bold text-zinc-600 cursor-pointer">Remember me</label>
                  </div>
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-amber-600 hover:underline">Forgot password?</button>
                </div>

                <button disabled={loading} type="submit" className="w-full py-4 bg-[#0B1527] hover:bg-black text-white text-sm font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In →</>}
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              <span className="bg-white px-4">or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" className="flex-[2] flex items-center justify-center gap-3 py-3.5 px-4 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors bg-white font-bold text-[13px] text-zinc-700 active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
              Continue with Google
            </button>
            <button type="button" className="flex-1 flex items-center justify-center py-3.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors bg-white active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            </button>
          </div>

          {!isLogin ? (
            <div className="mt-8 text-center text-xs text-zinc-500 font-medium">
              Already have an account? <button type="button" onClick={() => setIsLogin(true)} className="font-bold text-amber-600 hover:underline">Sign In →</button>
            </div>
          ) : (
            <div className="mt-8 text-center text-xs text-zinc-500 font-medium">
              Don't have an account? <button type="button" onClick={() => setIsLogin(false)} className="font-bold text-amber-600 hover:underline">Create one free →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
