import React, { useRef, useState } from 'react';
import { MovieProject } from '../types';
import { CURRENCY_FORMATTER } from '../constants';
import { TrendingUp, Users, Zap, ShieldCheck } from 'lucide-react';

interface ProjectCardProps {
  project: MovieProject;
  onClick: (project: MovieProject) => void;
  onQuickInvest?: (project: MovieProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onQuickInvest }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [shine, setShine] = useState({ x: 0, y: 0, opacity: 0 });
  const progress = (project.currentFunding / project.fundingGoal) * 100;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-15 to 15 degrees for more depth)
    const rotateY = ((x / rect.width) - 0.5) * 30;
    const rotateX = ((y / rect.height) - 0.5) * -30;
    
    setTilt({ x: rotateX, y: rotateY });
    setShine({ 
      x: (x / rect.width) * 100, 
      y: (y / rect.height) * 100,
      opacity: 0.5
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShine(prev => ({ ...prev, opacity: 0 }));
    setIsHovered(false);
  };

  const handleQuickInvest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickInvest) {
      onQuickInvest(project);
    }
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(project)}
      style={{ 
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1})`,
        transformStyle: 'preserve-3d',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
      }}
      className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-900 transition-all duration-300 hover:border-yellow-400/40 hover:shadow-[0_40px_80px_-20px_rgba(250,204,21,0.2)]"
    >
      {/* 3D Shine Effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(254, 240, 138, ${shine.opacity}), transparent 60%)`,
          mixBlendMode: 'overlay'
        }}
      />

      <div className="aspect-[2/3] relative preserve-3d">
        <img 
          src={project.posterUrl} 
          alt={project.title}
          style={{ transform: 'translateZ(10px)' }}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-95" />
        
        {/* Success Score Badge */}
        {project.successProbability && (
          <div 
            style={{ transform: 'translateZ(30px)' }}
            className="absolute top-5 right-5 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-yellow-400/20 flex items-center gap-2 z-10 shadow-2xl"
          >
            <TrendingUp size={12} className="text-yellow-400" />
            <span className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.1em]">{project.successProbability}% Success</span>
          </div>
        )}

        {/* Floating Category Tag */}
        <div 
          style={{ transform: 'translateZ(20px)' }}
          className="absolute top-5 left-5 bg-yellow-400/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-yellow-400/10 z-10"
        >
          <span className="text-[8px] font-black text-yellow-400/80 uppercase tracking-widest">{project.genre}</span>
        </div>

        <div 
          style={{ transform: 'translateZ(50px)' }}
          className="absolute bottom-0 left-0 right-0 p-8 space-y-5"
        >
          <div className="space-y-1">
            <h3 className="text-2xl font-bold leading-tight group-hover:text-yellow-400 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{project.title}</h3>
            <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Live Production Node
            </div>
          </div>
          
          <div className="space-y-2.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-zinc-400">Ledger Raised</span>
              <span className="text-yellow-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5 p-[2px]">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(250,204,21,0.6)]" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] font-black text-white">{CURRENCY_FORMATTER.format(project.currentFunding)}</span>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                <Users size={10} className="text-yellow-400/40" />
                <span>{project.investorCount} Qualified Backers</span>
              </div>
            </div>
            
            <button 
              onClick={handleQuickInvest}
              className="flex items-center gap-2 px-5 py-3 bg-yellow-400 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transform transition-all duration-300 active:scale-95 hover:bg-yellow-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] shadow-[0_10px_30px_rgba(250,204,21,0.3)] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
            >
              <Zap size={14} fill="currentColor" />
              Quick Stake
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Border Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
    </div>
  );
};

export default ProjectCard;