import React, { useEffect, useState } from 'react';
import { Sparkles, Star, Heart, X, Coins, ShieldCheck, ChevronRight, HelpCircle, Film, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';
import { MovieProject } from '../../types';
import { subscribeToActiveProjects } from '../../services/projectService';

interface MobileDiscoverViewProps {
  onSelectProject: (project: MovieProject) => void;
  onOpenSubmission?: () => void;
}

export const MobileDiscoverView: React.FC<MobileDiscoverViewProps> = ({
  onSelectProject,
  onOpenSubmission
}) => {
  const [projects, setProjects] = useState<MovieProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToActiveProjects(
      (data) => {
        setProjects(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'PENDING');

  const listToUse = activeProjects;
  const currentPitch = listToUse[currentIndex];

  const handleNext = () => {
    if (currentIndex < listToUse.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(listToUse.length); // Out of bounds triggers finished state
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  const handleBFIContact = (personName: string, roleOrProject: string) => {
    const subject = encodeURIComponent(`Connection Request: Inquiry for ${personName} (${roleOrProject})`);
    const body = encodeURIComponent(`Hello BFI Team,\n\nI would like to contact "${personName}" (${roleOrProject}) for work-related reasons. Please help arrange this connection.\n\nThank you.`);
    
    const mailtoUrl = `mailto:bharatfilmindustry@gmail.com?subject=${subject}&body=${body}`;
    const whatsappUrl = `https://wa.me/919652919968?text=${encodeURIComponent(`Hello BFI Team, I want to connect with ${personName} (${roleOrProject}) for work. Please arrange this.`)}`;

    const choice = window.confirm(
      `To protect user privacy, direct contact is disabled. Your connection request will be routed to BFI Admin.\n\nClick OK to contact via WhatsApp, or Cancel to contact via Email.`
    );

    if (choice) {
      window.open(whatsappUrl, '_blank');
    } else {
      window.location.href = mailtoUrl;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-900 border-t-[#FACC15] animate-spin" />
        <p className="text-[10px] text-[#FACC15] font-black uppercase tracking-widest">Loading Screenplays...</p>
      </div>
    );
  }

  // Finished swiping all pitches
  if (currentIndex >= listToUse.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4 py-16 space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-emerald-950/60 border border-yellow-500/20 rounded-full flex items-center justify-center text-[#FACC15] shadow-lg">
          <Film size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white font-serif">End of Pitch Deck</h3>
          <p className="text-xs text-emerald-400/80 max-w-xs mx-auto leading-relaxed">
            You've reviewed all active film pitches. Start a new loop, or submit your own creative screenplay!
          </p>
        </div>
        <div className="flex flex-col w-full gap-3 pt-4">
          <button
            onClick={handleReset}
            className="w-full py-4 bg-emerald-950/80 border border-yellow-500/10 text-[#FACC15] font-black text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Replay Pitches
          </button>
          {onOpenSubmission && (
            <button
              onClick={onOpenSubmission}
              className="w-full py-4 bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] font-black text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              List Screenplay
            </button>
          )}
        </div>
      </div>
    );
  }

  const progressPct = Math.round((currentPitch.currentFunding / currentPitch.fundingGoal) * 100) || 0;

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
      {/* Top Deck Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-white font-serif">Discover Pitches</h2>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Swipe right to support, left to skip</p>
        </div>
        <span className="text-xs bg-emerald-950/80 border border-yellow-500/10 px-3 py-1.5 rounded-full font-mono text-[#FACC15]">
          {currentIndex + 1} / {listToUse.length}
        </span>
      </div>

      {/* Main Swipeable Card Stack Container */}
      <div className="relative h-[480px] w-full preserve-3d">
        <div className="absolute inset-0 bg-emerald-950/50 border border-yellow-500/10 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Card Poster Back Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center -z-20 opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url(${currentPitch.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-transparent -z-10" />

          {/* Top card metadata */}
          <div className="flex justify-between items-start">
            <span className="bg-[#FACC15] text-[#021f18] text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest border border-yellow-500/20">
              {currentPitch.genre}
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1 rounded-full border border-yellow-500/5 text-[9px] font-black text-emerald-400 uppercase">
              <ShieldCheck size={10} className="text-[#FACC15]" />
              Verified SWA
            </div>
          </div>

          {/* Center visual indicator/icon */}
          <div className="flex justify-center items-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#021f18]/60 border border-yellow-500/15 flex items-center justify-center text-[#FACC15]/80 shadow-[0_0_20px_rgba(250,204,21,0.1)]">
              <Film size={26} className="animate-pulse" />
            </div>
          </div>

          {/* Bottom Pitch Details */}
          <div className="space-y-4 pt-4 border-t border-yellow-500/5">
            <div>
              <h3 className="text-xl font-bold text-white font-serif leading-tight">{currentPitch.title}</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1 leading-snug">{currentPitch.tagline}</p>
              <p className="text-[11px] text-[#FFFBEB]/70 line-clamp-3 leading-relaxed mt-2.5">
                {currentPitch.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 bg-emerald-950/40 border border-yellow-500/5 p-3 rounded-2xl">
              <div>
                <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-widest block">Total Budget</span>
                <span className="text-xs font-extrabold text-[#FFFBEB] font-mono mt-0.5 block">
                  {typeof currentPitch.budget === 'number' ? `₹${(currentPitch.budget / 10000000).toFixed(2)} Cr` : currentPitch.budget}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-widest block">Funding Goal</span>
                <span className="text-xs font-extrabold text-[#FACC15] font-mono mt-0.5 block">
                  {typeof currentPitch.fundingGoal === 'number' ? `₹${(currentPitch.fundingGoal / 100000).toFixed(2)} L` : currentPitch.fundingGoal}
                </span>
              </div>
            </div>

            {/* Escrow Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-black text-emerald-400 tracking-wider">
                <span>ESCROW DEPLOYMENT</span>
                <span className="text-[#FACC15] font-mono">{progressPct}%</span>
              </div>
              <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#FACC15] to-emerald-400 h-full rounded-full" 
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Control Buttons */}
      <div className="flex justify-center items-center gap-6 pt-2">
        {/* Skip button (X) */}
        <button
          onClick={handleNext}
          className="w-14 h-14 bg-emerald-950/60 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500/10 active:scale-90 transition-transform shadow-lg cursor-pointer"
          aria-label="Skip Pitch"
        >
          <X size={24} className="stroke-[2.5]" />
        </button>

        {/* Invest/Detail button (Gold Circle) */}
        <button
          onClick={() => {
            onSelectProject(currentPitch);
          }}
          className="w-18 h-18 bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] rounded-full flex items-center justify-center hover:opacity-90 active:scale-90 transition-transform shadow-2xl shadow-yellow-500/20 cursor-pointer"
          aria-label="Invest in Pitch"
        >
          <Coins size={28} className="stroke-[2.5]" />
        </button>

        {/* Message/Connect button */}
        <button
          onClick={() => {
            handleBFIContact(currentPitch.director || 'BFI Director', `Director of ${currentPitch.title}`);
          }}
          className="w-14 h-14 bg-emerald-950/60 border border-yellow-500/20 text-[#FACC15] rounded-full flex items-center justify-center hover:bg-[#FACC15]/10 active:scale-90 transition-transform shadow-lg cursor-pointer"
          aria-label="Connect with Director"
        >
          <MessageSquare size={20} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
