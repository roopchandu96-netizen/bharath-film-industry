import React from 'react';
import { Coins, FileText, Briefcase, Camera, Film, Globe, GraduationCap, ChevronRight, Aperture, Keyboard } from 'lucide-react';
import { MovieProject } from '../../types';

interface MobileExploreViewProps {
  onSelectProject: (project: MovieProject) => void;
  onOpenSubmission?: () => void;
}

export const MobileExploreView: React.FC<MobileExploreViewProps> = ({
  onSelectProject,
  onOpenSubmission
}) => {
  // Mock projects matching Screen 1 and details
  const mockProjects: MovieProject[] = [];

  return (
    <div className="space-y-6 pb-6">
      {/* Ecosystem Hub Hero */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em]">Ecosystem Hub</span>
        <h2 className="text-3xl font-extrabold text-white mt-1 leading-tight font-serif">Project Genesis</h2>
      </div>

      {/* Funding Hub Card */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 relative shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-amber-400">Funding Hub</h3>
            <p className="text-xs text-[#a39a88] mt-0.5">Fuel your cinematic vision.</p>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
            <Coins size={20} className="stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center text-xs">
          <span className="text-[#a39a88]">Active Rounds</span>
          <span className="font-bold text-amber-500">12 Projects</span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-[#2a2214] h-2.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full w-[75%]" />
        </div>

        <p className="text-[10px] text-[#8c826e] font-medium tracking-wide mt-2">
          75% of quarterly funding goal achieved.
        </p>
      </div>

      {/* 4-Grid Dashboard Squares */}
      <div className="grid grid-cols-2 gap-4">
        {/* Scripts */}
        <div className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col justify-between h-28 shadow-md">
          <div className="text-amber-500">
            <FileText size={20} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-wider">Scripts</span>
            <p className="text-xl font-bold text-white mt-0.5">450+</p>
          </div>
        </div>

        {/* Producer Hub */}
        <div 
          onClick={onOpenSubmission}
          className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col justify-between h-28 shadow-md cursor-pointer active:scale-95 transition-transform"
        >
          <div className="text-amber-500">
            <Briefcase size={20} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-wider">Producer Hub</span>
            <p className="text-xl font-bold text-white mt-0.5">Active</p>
          </div>
        </div>

        {/* Rentals */}
        <div className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col justify-between h-28 shadow-md">
          <div className="text-amber-500">
            <Camera size={20} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-wider">Rentals</span>
            <p className="text-xl font-bold text-white mt-0.5">2.4k</p>
          </div>
        </div>

        {/* Post-Pro */}
        <div className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col justify-between h-28 shadow-md">
          <div className="text-amber-500">
            <Film size={20} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-wider">Post-Pro</span>
            <p className="text-xl font-bold text-white mt-0.5">Studio</p>
          </div>
        </div>
      </div>

      {/* Film Services Banner */}
      <div className="bg-gradient-to-r from-black/80 via-black/40 to-transparent relative rounded-3xl overflow-hidden border border-[#2e2617] h-32 flex flex-col justify-end p-6 shadow-md">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600')] bg-cover bg-center -z-10 opacity-30 mix-blend-luminosity" />
        <h3 className="text-lg font-bold text-white leading-none">Film Services</h3>
        <p className="text-xs text-[#a39a88] mt-1">On-location logistics & legal.</p>
      </div>

      {/* 2-Grid Squares */}
      <div className="grid grid-cols-2 gap-4">
        {/* Network */}
        <div className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col justify-between h-28 shadow-md">
          <div className="text-amber-500">
            <Globe size={20} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-wider">Network</span>
            <p className="text-xl font-bold text-white mt-0.5">Global</p>
          </div>
        </div>

        {/* Academy */}
        <div className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col justify-between h-28 shadow-md">
          <div className="text-amber-500">
            <GraduationCap size={20} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-wider">Academy</span>
            <p className="text-xl font-bold text-white mt-0.5">Master</p>
          </div>
        </div>
      </div>

      {/* Live Opportunities Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold tracking-wide">Live Opportunities</h3>
          <button className="text-[10px] font-black uppercase text-amber-500 tracking-wider hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-amber-500/40 active:scale-[0.99] transition-all shadow-md"
            >
              {/* Thumbnail Icon */}
              <div className="w-12 h-12 bg-black rounded-xl border border-[#2e2617] flex items-center justify-center text-amber-500 shadow-inner flex-shrink-0">
                {project.id === 'aeon7' ? (
                  <Aperture size={22} className="stroke-[2]" />
                ) : (
                  <Keyboard size={22} className="stroke-[2]" />
                )}
              </div>

              {/* Title & Stats */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{project.title}</h4>
                <p className="text-[10px] text-[#a39a88] truncate mt-0.5">{project.tagline}</p>
              </div>

              {/* Right Side Info */}
              <div className="text-right flex-shrink-0">
                {project.id === 'aeon7' ? (
                  <>
                    <span className="text-xs font-black text-amber-500">82%</span>
                    <p className="text-[8px] text-[#8c826e] font-black uppercase tracking-wider mt-0.5">Funded</p>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-black text-[#60a5fa]">NEW</span>
                    <p className="text-[8px] text-[#8c826e] font-black uppercase tracking-wider mt-0.5">Listed</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
