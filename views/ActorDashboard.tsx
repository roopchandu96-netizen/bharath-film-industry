import React, { useState } from 'react';
import { User } from '../types';
import { Camera, Search, UserCheck, Video, FileText, Send, Star, AlertCircle } from 'lucide-react';

interface ActorDashboardProps {
  user: User;
}

const ActorDashboard: React.FC<ActorDashboardProps> = ({ user }) => {
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [reelLink, setReelLink] = useState('');
  const [auditionSubmissions, setAuditionSubmissions] = useState<any[]>([]);
  const [castingCalls] = useState([
    { id: '1', project: 'Preema Preethi', role: 'Female Lead (Age 20-25)', description: 'Expressive actor for high-drama romantic scenes. Needs classical dance background.', budget: 'Competitive', deadline: '2026-07-01' },
    { id: '2', project: 'The Last Monarch', role: 'Supporting General (Age 35-50)', description: 'Commanding posture, strong voice, sword combat training preferred.', budget: 'Per Day Basis', deadline: '2026-06-30' }
  ]);

  const handleApply = (callId: string) => {
    setActiveCall(callId);
  };

  const submitAudition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelLink.trim()) return;
    const targetCall = castingCalls.find(c => c.id === activeCall);
    const submission = {
      project: targetCall?.project,
      role: targetCall?.role,
      reel: reelLink,
      date: new Date().toLocaleDateString(),
      status: 'UNDER_REVIEW'
    };
    setAuditionSubmissions([submission, ...auditionSubmissions]);
    alert(`Audition tape for role "${targetCall?.role}" has been successfully queued for director review.`);
    setReelLink('');
    setActiveCall(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-200">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Casting Calls', val: castingCalls.length + ' Active', icon: '🎭', color: 'text-amber-500' },
          { label: 'Submissions', val: auditionSubmissions.length, icon: '📼', color: 'text-blue-500' },
          { label: 'Profile Rating', val: '4.8 ★', icon: '⭐', color: 'text-yellow-400' },
          { label: 'Verification', val: 'Verified Profile', icon: '✅', color: 'text-green-500' }
        ].map((m, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{m.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{m.val}</h3>
            </div>
            <span className="text-3xl">{m.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Casting Calls List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div>
              <h3 className="text-xl font-serif text-white">Active Casting Calls</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Browse active auditions from BFI filmmakers</p>
            </div>

            <div className="space-y-4">
              {castingCalls.map(call => (
                <div key={call.id} className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{call.role}</h4>
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{call.project}</p>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">Deadline: {call.deadline}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{call.description}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Pay: {call.budget}</span>
                    <button
                      onClick={() => handleApply(call.id)}
                      className="px-5 py-2 bg-yellow-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-yellow-400 transition-all"
                    >
                      Submit Audition
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audition Portal & Portfolio */}
        <div className="space-y-6">
          {activeCall ? (
            <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6 animate-in zoom-in duration-300">
              <div>
                <h3 className="text-lg font-serif text-white">Submit Audition Reel</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Direct casting submissions</p>
              </div>

              <form onSubmit={submitAudition} className="space-y-4">
                <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3 text-yellow-500 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Ensure you have rehearsed the script dialogue before submitting your video link.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Video Reel Link (YouTube / Drive)</label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input required type="url" value={reelLink} onChange={e => setReelLink(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 pl-12 pr-4 text-xs focus:border-amber-500 outline-none text-white font-mono" placeholder="https://youtube.com/..." />
                  </div>
                </div>

                <button type="submit" className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                  <Send size={12} /> Submit Tape
                </button>
                <button type="button" onClick={() => setActiveCall(null)} className="w-full text-center text-[10px] text-zinc-500 uppercase font-black tracking-widest hover:text-white pt-2">Cancel</button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
              <div>
                <h3 className="text-lg font-serif text-white">Portfolio Vault</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Manage actor headshots &amp; reels</p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2 hover:border-amber-500/30 transition-colors cursor-pointer group">
                  <Camera size={24} className="mx-auto text-zinc-600 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-white">Upload Headshot</p>
                  <p className="text-[9px] text-zinc-500">PNG or JPG (Max 5MB)</p>
                </div>

                {auditionSubmissions.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-900">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">My Submissions</p>
                    <div className="space-y-2">
                      {auditionSubmissions.map((sub, i) => (
                        <div key={i} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-white">{sub.role}</p>
                            <p className="text-[8px] text-zinc-500 uppercase">{sub.project} • {sub.date}</p>
                          </div>
                          <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">{sub.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActorDashboard;
