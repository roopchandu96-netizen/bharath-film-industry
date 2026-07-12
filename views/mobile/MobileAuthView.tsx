import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { Loader2, Mail, Lock, User, Clapperboard, Eye, EyeOff, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { UserRole } from '../../types';

export const MobileAuthView: React.FC = () => {
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
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP support matching web AuthView
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreeTerms) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await auth.signIn(email.trim(), password);
        window.location.reload();
      } else {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        await auth.signUp(email.trim(), password, selectedRole, fullName);
        setIsVerifyingOtp(true);
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
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
      setError(err?.message || "Invalid OTP code.");
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

  if (isVerifyingOtp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#021f18] via-[#064E3B] to-[#021f18] text-[#FFFBEB] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#FACC15]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] bg-[#FACC15]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm bg-emerald-950/40 border border-yellow-500/10 rounded-[2.2rem] p-6 space-y-6 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold font-serif text-white">Enter OTP Verification</h3>
            <p className="text-xs text-emerald-400">We have sent a verification code to {email}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-3 px-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-emerald-400 tracking-widest px-1">OTP Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-emerald-950/20 border border-yellow-500/10 rounded-2xl py-4 px-6 text-sm text-white placeholder-emerald-800/60 focus:border-[#FACC15] outline-none font-mono text-center tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] font-extrabold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {loading && <Loader2 className="animate-spin" size={14} />}
              Verify OTP
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#021f18] via-[#064E3B] to-[#021f18] text-[#FFFBEB] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[250px] h-[400px] bg-[#FACC15]/5 rounded-full blur-[120px] pointer-events-none transform -rotate-45" />
        <div className="absolute bottom-[5%] right-[5%] w-[300px] h-[300px] bg-[#FACC15]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm bg-emerald-950/40 border border-yellow-500/10 rounded-[2.2rem] p-6 space-y-6 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => { setIsForgotPassword(false); setResetSent(false); setError(null); }} className="p-2 text-[#FACC15] hover:text-white transition-colors bg-transparent border-none outline-none cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold font-serif text-white">Reset Access Key</h2>
          </div>

          {resetSent ? (
            <div className="space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mx-auto">
                <ShieldCheck size={32} />
              </div>
              <p className="text-xs text-emerald-400 leading-relaxed uppercase font-black tracking-widest">
                A secure reset link has been sent to <span className="text-[#FACC15]">{email}</span>.
              </p>
              <button onClick={() => setIsForgotPassword(false)} className="w-full py-4 bg-emerald-950 border border-yellow-500/10 text-[#FACC15] font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-900 transition-all cursor-pointer">
                Return to Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-emerald-400/80 uppercase font-black tracking-widest leading-relaxed">
                Provide your email address to initiate a password reset.
              </p>
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">{error}</div>}
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest px-1 block mb-1.5">EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={16} />
                    <input type="email" placeholder="name@industry.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-emerald-950/20 border border-yellow-500/10 rounded-xl py-3.5 pl-12 pr-4 text-xs text-white placeholder-emerald-800/60 focus:border-[#FACC15] outline-none" />
                  </div>
                </div>
                <button disabled={loading} type="submit" className="w-full py-4 bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] font-extrabold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none">
                  {loading ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Get Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#021f18] via-[#064E3B] to-[#021f18] text-[#FFFBEB] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Cinematic Theater Spotlights */}
      <div className="absolute top-[5%] left-[-15%] w-[350px] h-[600px] bg-[#FACC15]/5 rounded-full blur-[130px] pointer-events-none transform -rotate-45" />
      <div className="absolute bottom-[5%] right-[-15%] w-[350px] h-[500px] bg-[#FACC15]/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Brand Logo & Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Clapperboard size={32} className="text-[#FACC15] fill-[#FACC15]/10 stroke-[2.2]" />
        <span className="text-3xl font-bold tracking-widest text-[#FFFBEB] font-serif">BFI</span>
      </div>

      {/* Glassmorphic Login/Signup Card */}
      <div className="w-full max-w-sm bg-emerald-950/40 border border-yellow-500/10 rounded-[2rem] p-7 space-y-6 shadow-2xl backdrop-blur-2xl relative z-10">
        
        {/* Toggle tabs */}
        <div className="flex border-b border-yellow-500/10 relative">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 pb-3 text-[13px] font-black uppercase tracking-widest transition-all relative cursor-pointer bg-transparent border-none ${
              isLogin ? 'text-white font-bold' : 'text-emerald-400/60'
            }`}
          >
            Login
            {isLogin && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FACC15] to-[#eab308] rounded-full" />}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 pb-3 text-[13px] font-black uppercase tracking-widest transition-all relative cursor-pointer bg-transparent border-none ${
              !isLogin ? 'text-white font-bold' : 'text-emerald-400/60'
            }`}
          >
            Sign Up
            {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FACC15] to-[#eab308] rounded-full" />}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-3 px-4 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest px-1 block mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/50" size={14} />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ravi"
                      className="w-full bg-emerald-950/20 border border-yellow-500/10 rounded-xl py-3 pl-9 pr-3 text-xs text-white placeholder-emerald-800/60 focus:border-[#FACC15] outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest px-1 block mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/50" size={14} />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Kumar"
                      className="w-full bg-emerald-950/20 border border-yellow-500/10 rounded-xl py-3 pl-9 pr-3 text-xs text-white placeholder-emerald-800/60 focus:border-[#FACC15] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Role selection dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest px-1 block mb-1">Register As</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-emerald-950 border border-yellow-500/10 rounded-xl py-3.5 px-4 text-xs text-white focus:border-[#FACC15] outline-none cursor-pointer"
                >
                  <option value={UserRole.INVESTOR}>Investor</option>
                  <option value={UserRole.DIRECTOR}>Director</option>
                  <option value={UserRole.PRODUCER}>Producer</option>
                  <option value={UserRole.WRITER}>Writer</option>
                  <option value={UserRole.ACTOR}>Actor</option>
                  <option value={UserRole.CREW}>Crew/VFX</option>
                  <option value={UserRole.VENDOR}>Vendor</option>
                  <option value={UserRole.DISTRIBUTOR}>Distributor</option>
                  <option value={UserRole.SERVICE_PROVIDER}>Services</option>
                  <option value={UserRole.STUDENT}>Student</option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest px-1 block mb-1">Phone</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-emerald-500/50">📞</span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-emerald-950/20 border border-yellow-500/10 rounded-xl py-3.5 pl-10 pr-4 text-xs text-white placeholder-emerald-800/60 focus:border-[#FACC15] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest px-1 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/50" size={14} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@industry.com"
                className="w-full bg-emerald-950/20 border border-yellow-500/10 rounded-xl py-3.5 pl-10 pr-4 text-xs text-white placeholder-emerald-800/60 focus:border-[#FACC15] outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">Password</label>
              {isLogin && (
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-bold text-[#FACC15] uppercase tracking-wider hover:underline bg-transparent border-0 p-0 cursor-pointer">
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/50" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-emerald-950/20 border border-yellow-500/10 rounded-xl py-3.5 pl-10 pr-10 text-xs text-white placeholder-emerald-800/60 focus:border-[#FACC15] outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500/50 hover:text-white bg-transparent border-0 p-0 cursor-pointer">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          {!isLogin && (
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-[3px] min-w-4 w-4 h-4 rounded border-yellow-500/10 bg-emerald-950 text-[#FACC15] focus:ring-[#FACC15] focus:ring-offset-0 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[10px] text-emerald-400/90 leading-relaxed cursor-pointer font-medium select-none">
                I agree to the <a href="#" className="font-bold text-[#FACC15] hover:underline">Terms of Service</a> and <a href="https://sites.google.com/view/bharatfilmindustry/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-bold text-[#FACC15] hover:underline">Privacy Policy</a>. I understand this is a financial investment platform.
              </label>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] font-black text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer border-none"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : (isLogin ? 'Sign In' : 'Create Free Account')}
          </button>
        </form>

        {/* Social Authentication */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-emerald-400/80 text-[9px] font-black uppercase tracking-widest">
            <span className="h-px bg-white/5 flex-1 mr-4" />
            Or Continue With
            <span className="h-px bg-white/5 flex-1 ml-4" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="py-3 bg-emerald-950/20 border border-yellow-500/10 rounded-xl text-xs font-bold text-zinc-300 flex items-center justify-center gap-2 hover:bg-emerald-900/40 active:scale-95 transition-all cursor-pointer">
              <span> Apple</span>
            </button>
            <button className="py-3 bg-emerald-950/20 border border-yellow-500/10 rounded-xl text-xs font-bold text-zinc-300 flex items-center justify-center gap-2 hover:bg-emerald-900/40 active:scale-95 transition-all cursor-pointer">
              <span>G Google</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-emerald-400/90 pt-2">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)} className="text-[#FACC15] font-extrabold hover:underline bg-transparent border-0 p-0 cursor-pointer">
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)} className="text-[#FACC15] font-extrabold hover:underline bg-transparent border-0 p-0 cursor-pointer">
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
