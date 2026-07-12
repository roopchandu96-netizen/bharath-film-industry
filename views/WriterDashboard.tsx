import React, { useState } from 'react';
import { User } from '../types';
import { FileText, Plus, Search, ShieldCheck, Sparkles, BookOpen, Download, HelpCircle, Send } from 'lucide-react';

interface WriterDashboardProps {
  user: User;
}

const WriterDashboard: React.FC<WriterDashboardProps> = ({ user }) => {
  const [activeView, setActiveView] = useState('library');
  const [scriptTitle, setScriptTitle] = useState('');
  const [genre, setGenre] = useState('Drama');
  const [logline, setLogline] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [scripts, setScripts] = useState<any[]>([]);

  const handleListScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegistered) {
      alert("You must confirm copyright registration first.");
      return;
    }
    const newScript = {
      id: String(scripts.length + 1),
      title: scriptTitle,
      genre,
      logline,
      registration: registrationNo,
      status: 'UNDER_REVIEW'
    };
    setScripts([newScript, ...scripts]);
    alert("Script listed in SWA/WGA Verified Library. Producers have been alerted.");
    setScriptTitle('');
    setLogline('');
    setRegistrationNo('');
    setIsRegistered(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-200">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Scripts Listed', val: scripts.length, icon: '📄', color: 'text-amber-500' },
          { label: 'SWA Registered', val: '100%', icon: '🛡️', color: 'text-green-500' },
          { label: 'Producer Matches', val: '2 Active', icon: '🤝', color: 'text-blue-500' },
          { label: 'Licensing Offers', val: '₹12L Est.', icon: '💰', color: 'text-purple-500' }
        ].map((m, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{m.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{m.val}</h3>
            </div>
            <span className={`text-3xl ${m.color}`}>{m.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scripts List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif text-white">Script Library</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Registered Screenplays &amp; Pitches</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <Search size={14} className="text-zinc-500" />
                <input placeholder="Search library..." className="bg-transparent border-0 outline-none text-xs text-white" />
              </div>
            </div>

            <div className="space-y-4">
              {scripts.map(s => (
                <div key={s.id} className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 max-w-lg">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><BookOpen size={16} /></span>
                      <h4 className="text-sm font-bold text-white">{s.title}</h4>
                      <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500">{s.genre}</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">"{s.logline}"</p>
                    <p className="text-[10px] text-zinc-600 font-mono">Reg: {s.registration}</p>
                  </div>
                  <div className="flex md:flex-col justify-end items-end gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      s.status === 'MATCHED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {s.status}
                    </span>
                    <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-wider flex items-center gap-1 mt-2">
                      <Download size={10} /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List Script Form */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
            <div>
              <h3 className="text-lg font-serif text-white">List Story/Script</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Pitch to active producers</p>
            </div>

            <form onSubmit={handleListScript} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Script Title</label>
                <input required value={scriptTitle} onChange={e => setScriptTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white" placeholder="e.g. Preema Preethi" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Genre</label>
                <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white">
                  <option>Romance/Drama</option>
                  <option>Action/Thriller</option>
                  <option>Sci-Fi Noir</option>
                  <option>Historical Epic</option>
                  <option>Comedy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Logline</label>
                <textarea required rows={3} value={logline} onChange={e => setLogline(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white resize-none" placeholder="A single sentence plot hooks..." />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">SWA/WGA Registration ID</label>
                <input required value={registrationNo} onChange={e => setRegistrationNo(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white font-mono" placeholder="e.g. SWA-XXXXX-IN" />
              </div>

              {/* SWA Check */}
              <div className="flex items-start gap-3 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                <input
                  type="checkbox"
                  required
                  id="swa-check"
                  checked={isRegistered}
                  onChange={e => setIsRegistered(e.target.checked)}
                  className="mt-0.5 accent-yellow-500 rounded border-zinc-800 bg-zinc-950 w-3.5 h-3.5 focus:ring-yellow-500"
                />
                <label htmlFor="swa-check" className="text-[9px] text-zinc-400 leading-relaxed cursor-pointer select-none">
                  I confirm that my script is registered under copyright authority (SWA/WGA) and is free of IP disputes.
                </label>
              </div>

              <button type="submit" className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                <Send size={12} /> Pitch Screenplay
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriterDashboard;
