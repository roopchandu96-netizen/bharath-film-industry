import React, { useState } from 'react';
import { User } from '../types';
import { Briefcase, Settings, Search, CheckCircle, Upload, Film, MapPin, Send } from 'lucide-react';

interface CrewDashboardProps {
  user: User;
}

const CrewDashboard: React.FC<CrewDashboardProps> = ({ user }) => {
  const [selectedCrewRole, setSelectedCrewRole] = useState('Cinematographer');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [portfolioLink, setPortfolioLink] = useState('');
  
  const techJobs = [
    { id: '1', project: 'Preema Preethi', role: 'Editor & Colorist', description: 'Requires expertise in DaVinci Resolve & Premiere Pro. Cinematic grade experience necessary.', location: 'Hyderabad, IN', duration: '3 Months Contract' },
    { id: '2', project: 'The Last Monarch', role: 'VFX Artist (CGI / Crowd Simulation)', description: 'Lead VFX artist to handle crowd rendering, digital environments, and composite layers.', location: 'Remote / Bangalore', duration: '6 Months Contract' }
  ];

  const handleApply = (jobId: string) => {
    setActiveJobId(jobId);
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioLink.trim()) return;
    const targetJob = techJobs.find(j => j.id === activeJobId);
    const app = {
      project: targetJob?.project,
      role: targetJob?.role,
      portfolio: portfolioLink,
      date: new Date().toLocaleDateString(),
      status: 'SUBMITTED'
    };
    setApplications([app, ...applications]);
    alert(`Application for "${targetJob?.role}" has been successfully broadcast to production leads.`);
    setPortfolioLink('');
    setActiveJobId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-200">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Technical Field', val: selectedCrewRole, icon: '🔧', color: 'text-amber-500' },
          { label: 'Open Positions', val: techJobs.length + ' Available', icon: '🎬', color: 'text-blue-500' },
          { label: 'Verified Rating', val: '4.9 ★', icon: '⭐', color: 'text-yellow-400' },
          { label: 'Total Projects Done', val: '5 Completed', icon: '✅', color: 'text-green-500' }
        ].map((m, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{m.label}</p>
              <h3 className="text-xl font-black text-white mt-1">{m.val}</h3>
            </div>
            <span className="text-3xl">{m.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Open Tech Openings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div>
              <h3 className="text-xl font-serif text-white">Technical Crew Openings</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Join active BFI movie production crews</p>
            </div>

            <div className="space-y-4">
              {techJobs.map(job => (
                <div key={job.id} className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{job.role}</h4>
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{job.project}</p>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{job.description}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Duration: {job.duration}</span>
                    <button
                      onClick={() => handleApply(job.id)}
                      className="px-5 py-2 bg-yellow-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-yellow-400 transition-all"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Showcase Portfolio */}
        <div className="space-y-6">
          {activeJobId ? (
            <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6 animate-in zoom-in duration-300">
              <div>
                <h3 className="text-lg font-serif text-white">Apply for Crew Role</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Direct technical application</p>
              </div>

              <form onSubmit={submitApplication} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Portfolio Link (Vimeo / ArtStation / Behance)</label>
                  <div className="relative">
                    <Film className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input required type="url" value={portfolioLink} onChange={e => setPortfolioLink(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 pl-12 pr-4 text-xs focus:border-amber-500 outline-none text-white font-mono" placeholder="https://vimeo.com/..." />
                  </div>
                </div>

                <button type="submit" className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                  <Send size={12} /> Submit Application
                </button>
                <button type="button" onClick={() => setActiveJobId(null)} className="w-full text-center text-[10px] text-zinc-500 uppercase font-black tracking-widest hover:text-white pt-2">Cancel</button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
              <div>
                <h3 className="text-lg font-serif text-white">Crew Technical Settings</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Select active technical category</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Primary Discipline</label>
                  <select
                    value={selectedCrewRole}
                    onChange={e => setSelectedCrewRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white font-bold"
                  >
                    <option>Cinematographer</option>
                    <option>Film Editor</option>
                    <option>VFX / CGI Compositor</option>
                    <option>Sound Designer</option>
                    <option>Art Director</option>
                    <option>Music Director</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2 hover:border-amber-500/30 transition-colors cursor-pointer group">
                  <Upload size={24} className="mx-auto text-zinc-600 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-white">Upload Reel Resume</p>
                  <p className="text-[9px] text-zinc-500">PDF or MP4 (Max 15MB)</p>
                </div>

                {applications.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-900">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Application Ledger</p>
                    <div className="space-y-2">
                      {applications.map((app, i) => (
                        <div key={i} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-white">{app.role}</p>
                            <p className="text-[8px] text-zinc-500 uppercase">{app.project} • {app.date}</p>
                          </div>
                          <span className="text-[8px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">{app.status}</span>
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

export default CrewDashboard;
