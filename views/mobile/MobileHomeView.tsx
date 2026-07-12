import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Play, Users, ChevronRight, MessageSquare, Star, ArrowUpRight, ShieldCheck, Heart, Share2, Award, Zap } from 'lucide-react';
import { MovieProject, User, UserRole } from '../../types';
import { subscribeToActiveProjects } from '../../services/projectService';

interface MobileHomeViewProps {
  user: User;
  onSelectProject: (project: MovieProject) => void;
  onOpenSubmission?: () => void;
  onQuickInvest?: (project: MovieProject, amount: number) => void;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  user,
  onSelectProject,
  onOpenSubmission,
  onQuickInvest
}) => {
  const [projects, setProjects] = useState<MovieProject[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter projects if needed, or use mock if none
  const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'PENDING');
  
  const displayFeatured = activeProjects.length > 0 ? activeProjects[0] : null;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Personalized Header Widget */}
      <div className="flex items-center justify-between bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[2rem] p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#FACC15]/5 rounded-full blur-xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#FACC15] font-black uppercase tracking-widest flex items-center gap-1">
              <Zap size={10} className="fill-[#FACC15]" />
              Welcome Back
            </span>
          </div>
          <h2 className="text-xl font-black text-[#FFFBEB] font-serif leading-tight">
            Hello, {user.name.split(' ')[0]}
          </h2>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            {user.role} • PREMIUM MEMBER
          </p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black uppercase text-emerald-400/70 tracking-widest block">Portfolio Val</span>
          <span className="text-base font-extrabold text-[#FACC15] font-mono">₹1.24 Cr</span>
          <span className="text-[8px] bg-emerald-500/20 text-[#FFFBEB] px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-black ml-1">
            +12.4%
          </span>
        </div>
      </div>

      {/* Featured Cinematic Poster Slide */}
      {displayFeatured && (
        <>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase text-[#FACC15] tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} className="fill-[#FACC15]" /> Featured Round
              </h3>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Live Escrow</span>
            </div>

            <div 
              onClick={() => onSelectProject(displayFeatured)}
              className="relative bg-emerald-950/60 border border-yellow-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer active:scale-[0.99] transition-all h-[260px] flex flex-col justify-end"
            >
              {/* Cover image backdrop */}
              <div 
                className="absolute inset-0 bg-cover bg-center -z-10 group-hover:scale-105 transition-transform duration-700" 
                style={{ backgroundImage: `url(${displayFeatured.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'})` }}
              />
              {/* Glassmorphic dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent -z-10" />

              {/* Featured details box */}
              <div className="p-6 space-y-3 bg-gradient-to-t from-emerald-950 via-emerald-950/95 to-transparent pt-12">
                <div>
                  <span className="bg-[#FACC15] text-[#021f18] text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    {displayFeatured.genre}
                  </span>
                  <h4 className="text-xl font-bold text-[#FFFBEB] font-serif leading-tight mt-1">{displayFeatured.title}</h4>
                  <p className="text-[10px] text-emerald-400/90 font-medium truncate mt-0.5">{displayFeatured.tagline || ''}</p>
                </div>

                {/* Funding Progress Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-emerald-400">
                    <span>VERIFIED ESCROW PROGRESS</span>
                    <span className="text-[#FACC15] font-mono">
                      {Math.round((displayFeatured.currentFunding / displayFeatured.fundingGoal) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden border border-yellow-500/5">
                    <div 
                      className="bg-gradient-to-r from-[#FACC15] to-emerald-400 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.round((displayFeatured.currentFunding / displayFeatured.fundingGoal) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-[#FFFBEB]/70">Director: <strong className="text-[#FFFBEB]">{displayFeatured.director}</strong></span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(displayFeatured);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] font-black uppercase tracking-widest text-[9px] rounded-xl active:scale-95 transition-transform flex items-center gap-1 shadow-md shadow-yellow-500/10"
                  >
                    View Node <ChevronRight size={10} className="stroke-[3.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Investments Shortcuts */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-[#FACC15]/80 tracking-widest block px-1">Quick Bid Deploy</span>
            <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-hide py-1">
              {[
                { label: '₹10,000', amount: 10000 },
                { label: '₹50,000', amount: 50000 },
                { label: '₹1,00,000', amount: 100000 },
                { label: '₹5,00,000', amount: 500000 }
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    if (onQuickInvest) {
                      onQuickInvest(displayFeatured, chip.amount);
                    } else {
                      onSelectProject(displayFeatured);
                    }
                  }}
                  className="bg-emerald-950/40 border border-yellow-500/10 hover:border-yellow-500/30 text-[#FACC15] px-4 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase whitespace-nowrap flex-shrink-0 active:scale-95 transition-all flex items-center gap-1"
                >
                  + {chip.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Trending Node Listings */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-black uppercase text-[#FACC15] tracking-widest flex items-center gap-1.5">
            <TrendingUp size={14} /> Trending Escrows
          </h3>
        </div>

        <div className="space-y-3">
          {activeProjects.slice(0, 3).map((project) => {
            const progress = Math.round((project.currentFunding / project.fundingGoal) * 100);
            return (
              <div 
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-md rounded-[1.8rem] p-4 flex items-center gap-4 cursor-pointer hover:border-yellow-500/20 active:scale-[0.99] transition-all shadow-md"
              >
                {/* Thumb */}
                <div 
                  className="w-14 h-14 rounded-2xl bg-cover bg-center border border-yellow-500/10 flex-shrink-0 relative overflow-hidden"
                  style={{ backgroundImage: `url(${project.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=200'})` }}
                >
                  <div className="absolute inset-0 bg-emerald-950/20" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-black uppercase text-[#FACC15] tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/15">
                    {project.genre}
                  </span>
                  <h4 className="text-sm font-bold text-[#FFFBEB] truncate mt-1">{project.title}</h4>
                  <div className="w-full bg-emerald-950/80 h-1 rounded-full overflow-hidden mt-2">
                    <div 
                      className="bg-gradient-to-r from-[#FACC15] to-emerald-400 h-full rounded-full" 
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                {/* Stats Right */}
                <div className="text-right flex-shrink-0 space-y-0.5">
                  <span className="text-xs font-black text-[#FACC15] font-mono">{progress}%</span>
                  <p className="text-[8px] text-emerald-400/80 uppercase font-black tracking-widest block">DEPLOYED</p>
                </div>
              </div>
            );
          })}

          {activeProjects.length === 0 && (
            <div className="bg-emerald-950/20 border border-yellow-500/5 backdrop-blur-md rounded-[1.8rem] p-6 text-center text-xs text-[#8f9b88]">
              No active escrow bidding rounds found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
