import React from 'react';
import { Film, User, Calendar, Play, Award, Sparkles } from 'lucide-react';

const OurWorksView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700 text-slate-200">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest">
          <Sparkles size={12} /> BFI Showcase
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white leading-tight">
          Our Featured <span className="text-amber-500 italic">Works</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Explore the official cinematic portfolio produced and directed under the Bharath Film Industry decentralized network.
        </p>
      </div>

      {/* Main Video Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Video Player Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            {/* Premium Gold Glow background */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-yellow-500/10 rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
            
            {/* Responsive Iframe Container */}
            <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-slate-800 bg-[#020617] shadow-2xl">
              <iframe
                src="https://www.youtube.com/embed/3edAshDQJE4"
                title="Vishwa Vikhyata Nata Sarwabhouma - Directed by Prathapaneni Roopchandu"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>

        {/* Video Details & Credits Card */}
        <div className="space-y-6 lg:mt-2">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/4 -translate-y-1/4" />
            
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-white leading-tight">
                Vishwa Vikhyata Nata Sarwabhouma
              </h2>
              <p className="text-amber-500 font-mono text-xs uppercase tracking-widest font-black">
                Short Film Showcase
              </p>
            </div>

            <hr className="border-slate-800" />

            {/* Production Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Role</p>
                  <p className="text-sm font-bold text-white">Director & Visionary</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Award size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Credit Attribution</p>
                  <p className="text-sm font-bold text-white">Prathapaneni Roopchandu</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Production Network</p>
                  <p className="text-sm font-bold text-white">Bharath Film Industry</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Description */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-black tracking-widest text-zinc-500">Director's Note</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                "I worked as the Director for this project. This short film represents our commitment to creating high-caliber independent cinema. Through BFI, we provide directors with full creative freedom and direct connection to audience backing to make stories like this possible."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurWorksView;
