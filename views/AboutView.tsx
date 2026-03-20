import React from 'react';
import { Github, Linkedin, Mail, Twitter, Film, ShieldCheck, Users } from 'lucide-react';

const AboutView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-24 space-y-16 animate-in fade-in duration-700 text-slate-200">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white leading-tight">
          Pioneering the Future of <span className="text-amber-500 italic">Film Investment</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mt-6">
          Bharath Film Industry (BFI) is India's first script investment marketplace and decentralized production network. We bridge the gap between visionary directors and passionate investors, turning remarkable stories into cinematic reality.
        </p>
      </div>

      {/* Founder Section */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden mt-16">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/3 shrink-0 relative">
            <div className="aspect-[3/4] overflow-hidden rounded-[2rem] border border-slate-700 shadow-2xl shadow-black/50 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity z-10" />
              <img 
                src="/founder.jpg" 
                alt="Prathapaneni Roopchandu - Founder / CEO" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 object-top"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <p className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-1">Founder & CEO</p>
                <p className="text-white font-bold text-xl">Prathapaneni Roopchandu</p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 space-y-8">
            <div className="space-y-5 text-slate-300 leading-relaxed text-lg">
              <h2 className="text-3xl font-serif text-white mb-6">A Vision for Indian Cinema</h2>
              <p>
                As a lifelong cinephile and tech innovator, I saw a fundamental flaw in how stories were brought to the screen. Brilliant directors were spending years chasing funding through outdated studio systems, while passionate audiences had no way to invest in the films they actually wanted to see.
              </p>
              <p>
                I founded <span className="text-white font-bold">Bharath Film Industry</span> to democratize cinematic production. By leveraging modern financial tech and an intuitive marketplace, we are returning the power of the greenlight directly to the people.
              </p>
              <p className="font-serif text-amber-500 italic text-2xl pt-4 pl-4 border-l-2 border-amber-500/30">
                "Our mission is simple: if a story deserves to be told, we ensure it gets funded, filmed, and seen."
              </p>
            </div>
            
            <div className="flex gap-4 pt-6">
              <button className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400 hover:bg-blue-400/10 transition-all">
                <Linkedin size={20} />
              </button>
              <button className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all">
                <Twitter size={20} />
              </button>
              <button className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400 hover:bg-amber-400/10 transition-all">
                <Mail size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        <div className="p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl space-y-4 hover:border-amber-500/30 transition-colors">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
            <Film size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">Creative Freedom</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            We empower directors to tell their authentic stories without studio interference, backing them securely through direct audience investment.
          </p>
        </div>
        
        <div className="p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl space-y-4 hover:border-blue-500/30 transition-colors">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">Secure Escrow</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every rupee is held securely until project milestones are verified. Institutional-grade security safeguarding the Indian film economy.
          </p>
        </div>
        
        <div className="p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl space-y-4 hover:border-green-500/30 transition-colors">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">Audience Owned</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Fans transcend from viewers to owners. When a BFI partnered film succeeds at the box office, our investors directly share in the profit.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default AboutView;
