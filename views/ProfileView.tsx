
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';
import { updateUserInFirestore, deleteUserAccount } from '../services/userService.ts';
import {
  ShieldCheck, User as UserIcon, Camera, Save,
  Trash2, AlertTriangle, Loader2,
  CheckCircle, Globe, Award, Mail, Key
} from 'lucide-react';
import { supabase } from '../services/firebase.ts';

interface ProfileViewProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [actualRole, setActualRole] = useState<string | null>(() => {
    if (!user) return null;
    try {
      const stored = localStorage.getItem(`bfi_actual_role_${user.id}`);
      if (!stored && user.role !== UserRole.MOVIE_LOVER) {
        localStorage.setItem(`bfi_actual_role_${user.id}`, user.role);
        return user.role;
      }
      return stored;
    } catch (e) {
      console.error("Failed to read actual role from storage:", e);
      return user.role || null;
    }
  });

  const handleSwitchRole = async (targetRole: UserRole, checkFirstTime = false) => {
    if (checkFirstTime && targetRole === UserRole.MOVIE_LOVER && !user.movieLoverActivated) {
      setShowActivationModal(true);
      return;
    }

    setIsSwitchingRole(true);
    setMessage(null);
    try {
      // 1. Update Supabase Auth User Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { role: targetRole, active_role: targetRole }
      });
      if (authError) throw authError;

      localStorage.setItem(`bfi_active_role_${user.id}`, targetRole);

      // 2. Prepare database updates
      const updates: Partial<User> = {
        activeRole: targetRole,
        role: targetRole // Keep legacy role field synced
      };
      if (targetRole === UserRole.MOVIE_LOVER) {
        updates.movieLoverActivated = true;
      }

      await updateUserInFirestore(user.id, updates);

      // Update parent state
      onUpdate({ ...user, ...updates });
      setMessage({ type: 'success', text: `Role switched to ${targetRole} successfully. Reloading workspace...` });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Role switch error:", err);
      localStorage.setItem(`bfi_active_role_${user.id}`, targetRole);
      // Fallback local updates
      const updates: Partial<User> = {
        activeRole: targetRole,
        role: targetRole
      };
      if (targetRole === UserRole.MOVIE_LOVER) {
        updates.movieLoverActivated = true;
      }
      onUpdate({ ...user, ...updates });
      setMessage({ type: 'success', text: `Workspace role updated to ${targetRole} locally. Reloading workspace...` });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } finally {
      setIsSwitchingRole(false);
      setShowActivationModal(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      // 1. Update Supabase User Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name, role: user.role }
      });

      if (authError) throw authError;

      // 2. Update Profiles Table (Ledger)
      await updateUserInFirestore(user.id, { name });

      onUpdate({ ...user, name });
      setMessage({ type: 'success', text: 'Institutional profile updated successfully.' });
    } catch (err: any) {
      console.error("Profile update error:", err);
      setMessage({ type: 'error', text: 'Update failed. Ledger connection unstable.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount(user.id);
      window.location.reload(); // Refresh to trigger auth redirect
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Revocation failed. Re-authenticate and try again.' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-10 p-10 rounded-[3.5rem] bg-zinc-950 border border-yellow-400/10 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Globe size={180} className="text-yellow-400" />
        </div>

        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 border-2 border-yellow-400/20 flex items-center justify-center text-yellow-400 overflow-hidden shadow-2xl">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={48} strokeWidth={1} />
            )}
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-yellow-400 text-black shadow-xl hover:scale-110 active:scale-95 transition-all">
            <Camera size={16} />
          </button>
        </div>

        <div className="space-y-4 text-center md:text-left flex-1">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl font-serif gold-gradient">{user.name}</h1>
              {user.kycStatus === 'VERIFIED' && (
                <ShieldCheck size={20} className="text-blue-500" />
              )}
            </div>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em]">{user.role} Authorization Active</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <div className="px-4 py-1.5 rounded-xl bg-yellow-400/5 border border-yellow-400/10 flex items-center gap-2">
              <Award size={12} className="text-yellow-400" />
              <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">
                {user.role === UserRole.DIRECTOR ? 'Verified Director' : 'Accredited Investor'}
              </span>
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
              <ShieldCheck size={12} className="text-zinc-600" />
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Verified node</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 shadow-2xl space-y-10">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Ledger Credentials</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Modify production identity</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Official Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-yellow-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-50 cursor-not-allowed">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Institutional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                    <input
                      disabled
                      value={user.email}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm text-zinc-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                  }`}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating || name === user.name}
                className="w-full py-5 rounded-2xl bg-yellow-400 text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-yellow-300 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Sync Ledger Updates
              </button>
            </form>
          </div>
        </div>

        {/* Account Settings / Danger Zone */}
        <div className="lg:col-span-5 space-y-10">
          <div className="p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 shadow-2xl space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Security Access</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Credential management</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between group hover:border-yellow-400/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-yellow-400 transition-colors">
                    <Key size={18} />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-white">Reset Access Key</span>
                    <p className="text-[8px] text-zinc-600 font-black uppercase">Standard 2FA protocol</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-8 border-t border-zinc-900 space-y-6">
              <div className="space-y-2">
                <h4 className="text-[10px] text-red-500/60 uppercase font-black tracking-widest">Danger Zone</h4>
                <p className="text-[10px] text-zinc-600 leading-relaxed italic">
                  Terminating your node will result in immediate loss of institutional access and archival of all producer credits.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500/40 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Revoke Institutional Node
                </button>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                  <p className="text-[9px] text-white font-bold text-center uppercase">Are you absolutely sure?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="py-4 rounded-2xl bg-zinc-900 text-zinc-400 text-[9px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="py-4 rounded-2xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workspace Role Toggle */}
          {user.primaryRole !== UserRole.MOVIE_LOVER && (
            <div className="p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 shadow-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Switch Role</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Toggle Workspace Mode</p>
              </div>

            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-xs">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Current Active Role:</span>
              <p className="font-extrabold text-white text-sm mt-1 flex items-center gap-1.5 animate-pulse">
                {(user.activeRole || user.role) === UserRole.MOVIE_LOVER ? '🎬 Movie Lover' : (user.activeRole || user.role)}
              </p>
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Toggle between your professional workspace and viewer mode to book tickets or stream releases without duplicate profiles.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSwitchRole(UserRole.MOVIE_LOVER, true)}
                disabled={isSwitchingRole || (user.activeRole || user.role) === UserRole.MOVIE_LOVER}
                className="w-full py-4 rounded-2xl bg-yellow-500 disabled:bg-yellow-500/10 disabled:text-zinc-600 disabled:border disabled:border-zinc-800/50 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-yellow-400 active:scale-95 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
              >
                {isSwitchingRole && (user.activeRole || user.role) !== UserRole.MOVIE_LOVER ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <span>Switch to Movie Lover</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchRole((user.primaryRole || user.role) as UserRole, false)}
                disabled={isSwitchingRole || (user.activeRole || user.role) !== UserRole.MOVIE_LOVER}
                className="w-full py-4 rounded-2xl bg-zinc-900 border border-yellow-500/20 hover:border-yellow-500/40 text-yellow-500 font-extrabold text-xs uppercase tracking-wider disabled:opacity-20 disabled:border-zinc-950 disabled:text-zinc-600 active:scale-95 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
              >
                {isSwitchingRole && (user.activeRole || user.role) === UserRole.MOVIE_LOVER ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <span>Switch Back to {user.primaryRole || user.role}</span>
                )}
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Become a Movie Lover Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-zinc-950 border-2 border-yellow-500/20 rounded-[3rem] p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-[1.5rem] bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto text-yellow-500">
              <Award size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Become a Movie Lover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Support original cinema and enjoy exclusive movie pre-bookings, premieres, and future benefits.
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black pt-2">
                Continue?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowActivationModal(false)}
                className="py-3 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl text-xs font-bold uppercase hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole(UserRole.MOVIE_LOVER, false)}
                className="py-3 px-4 bg-yellow-500 text-black rounded-2xl text-xs font-black uppercase hover:bg-yellow-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Contact / Support Section */}
      <div className="w-full">
        <div className="p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 shadow-2xl space-y-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-bold text-white tracking-tight">Concierge Support</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest"> Direct Assistance & Inquiries</p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Need help with your account, investments, or project listings? Our support team is available to assist you via email. {(user.role === UserRole.INVESTOR || user.role === 'INVESTOR' || user.role === UserRole.ADMIN || user.role === 'ADMIN') && 'Investors can also use our exclusive WhatsApp concierge.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Role-Based Contact Options */}
            {(user.role === UserRole.INVESTOR || user.role === 'INVESTOR' || user.role === UserRole.ADMIN || user.role === 'ADMIN') && (
              <a
                href="https://wa.me/919652919968"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
              >
                <span className="text-lg">💬</span> WhatsApp Support
              </a>
            )}

            <a
              href="mailto:bharatfilmindustry@gmail.com"
              className="px-8 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
            >
              <Mail size={16} /> Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;