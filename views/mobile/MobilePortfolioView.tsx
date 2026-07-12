import React from 'react';
import { TrendingUp, Shield, HelpCircle, Users, Award, Landmark, ChevronRight } from 'lucide-react';
import { MovieProject } from '../../types';

interface MobilePortfolioViewProps {
  onSelectProject: (project: MovieProject) => void;
}

export const MobilePortfolioView: React.FC<MobilePortfolioViewProps> = ({
  onSelectProject
}) => {
  const featuredProject: MovieProject = {
    id: 'empireofash',
    title: 'Empire of Ash',
    tagline: 'Historical Epic • Theatre & IMAX',
    genre: 'Historical Epic',
    budget: '₹120.00 Cr',
    fundingGoal: 12000000,
    currentFunding: 10200000, // 85%
    description: 'An epic drama chronicling the rise and fall of ancient kingdoms, shot specifically for large-screen formats and IMAX theatrical distribution.',
    posterUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?q=80&w=600',
    teaserUrl: '',
    director: 'S. Rajamouli',
    status: 'ACTIVE',
    investorCount: 4210,
    createdAt: ''
  };

  const trendingProjects = [
    {
      id: 'neomumbai',
      title: 'Neo-Mumbai 2077',
      tagline: 'Sci-Fi • 400+ Investors',
      filled: '94% Filled',
      image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=200'
    },
    {
      id: 'mittikarang',
      title: 'Mitti Ka Rang',
      tagline: 'Drama • 1.2k+ Investors',
      filled: '78% Filled',
      image: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=200'
    }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white leading-tight font-serif">
          Welcome to Bharat Film Industry
        </h2>
        <p className="text-xs text-[#a39a88] mt-1">
          Invest In Stories. Build the Future of Cinema.
        </p>
      </div>

      {/* Total Investment Card */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 relative shadow-lg">
        <div className="space-y-0.5">
          <span className="text-[9px] font-black uppercase text-[#8c826e] tracking-widest">Total Investment</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">₹1,24,50,000</span>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
              +12.4%
            </span>
          </div>
        </div>

        {/* Dashboard mini-grid stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-[#251f14] pt-4">
          <div>
            <span className="text-[9px] font-black uppercase text-[#8c826e] tracking-widest block">Active Projects</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">08</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-[#8c826e] tracking-widest block">Producer Credits</span>
            <span className="text-xl font-bold text-amber-500 mt-0.5 block">Tier II</span>
          </div>
        </div>

        {/* Profit Distribution Vertical Bar Chart (Gold theme SVG) */}
        <div className="mt-6 border-t border-[#251f14] pt-4">
          <span className="text-[9px] font-black uppercase text-[#8c826e] tracking-widest block mb-4">Profit Distribution</span>
          <div className="h-32 flex items-end justify-between px-2 bg-[#0d0a06]/50 rounded-2xl p-4 border border-[#251f14]">
            {/* 6 vertical gold bars */}
            {[25, 40, 52, 68, 60, 92].map((height, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                <div className="w-4 bg-[#2a2214] rounded-t-md h-24 flex items-end relative overflow-hidden">
                  <div 
                    style={{ height: `${height}%` }}
                    className="w-full bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-md transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Opportunities Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold tracking-wide">Featured Opportunities</h3>
          <button className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
            View All
          </button>
        </div>

        {/* Featured Card */}
        <div 
          onClick={() => onSelectProject(featuredProject)}
          className="bg-[#16120a] border border-[#eab308]/20 rounded-3xl overflow-hidden shadow-lg relative cursor-pointer active:scale-[0.99] transition-all"
        >
          {/* Header Photo */}
          <div className="h-44 relative bg-black">
            <img 
              src={featuredProject.posterUrl} 
              alt={featuredProject.title} 
              className="w-full h-full object-cover opacity-60 mix-blend-screen"
            />
            {/* Verified badge */}
            <span className="absolute top-4 right-4 bg-[#eab308] text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              ✓ Verified
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-xl font-bold text-white leading-tight font-serif">{featuredProject.title}</h4>
              <p className="text-xs text-[#a39a88] mt-1">{featuredProject.tagline}</p>
            </div>

            {/* Progress line */}
            <div>
              <div className="flex justify-between text-[10px] text-[#a39a88] font-bold">
                <span>Funding Progress</span>
                <span className="text-amber-500">85%</span>
              </div>
              <div className="w-full bg-[#2a2214] h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[85%]" />
              </div>
            </div>

            {/* ROI Potential and Invest Button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#251f14]">
              <div>
                <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">ROI Potential</span>
                <span className="text-sm font-extrabold text-[#eae3d2] mt-0.5 block">18-24% APR</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProject(featuredProject);
                }}
                className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:from-amber-300 hover:to-yellow-400 active:scale-95 transition-all shadow-md"
              >
                Invest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Contract Escrow Security Card */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
            <Shield size={20} className="stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-white">Smart Contract Escrow</h3>
        </div>

        <p className="text-xs text-[#a39a88] leading-relaxed">
          All funds are locked in decentralized multi-sig vaults until production milestones are verified by legal auditors.
        </p>

        {/* Custom status tags */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-1.5 bg-[#0d0a06] border border-[#251f14] py-2 px-3 rounded-xl text-[9px] font-black text-amber-500/90 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Funds Secured
          </div>
          <div className="flex items-center gap-1.5 bg-[#0d0a06] border border-[#251f14] py-2 px-3 rounded-xl text-[9px] font-black text-amber-500/90 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Legal Verified
          </div>
        </div>
      </div>

      {/* Community Fund Card */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Landmark size={20} className="stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-white">Community Fund</h3>
          </div>
        </div>

        <p className="text-xs text-[#a39a88] leading-relaxed">
          Contribute to the collective pool for indie creators and share upside across 20+ projects.
        </p>

        <div className="flex justify-between items-baseline pt-2">
          <div>
            <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Pool TVL</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">₹45.2Cr</span>
          </div>
          <button className="px-6 py-2.5 bg-transparent border border-[#2e2617] text-amber-500 font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all">
            Join the Pool
          </button>
        </div>
      </div>

      {/* Trending Now List */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold tracking-wide">Trending Now</h3>
        
        <div className="space-y-3">
          {trendingProjects.map((proj) => (
            <div 
              key={proj.id}
              className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-3 flex items-center gap-4 shadow-sm"
            >
              {/* Image thumbnail */}
              <div 
                className="w-12 h-12 rounded-xl bg-cover bg-center border border-[#251f14] flex-shrink-0"
                style={{ backgroundImage: `url(${proj.image})` }}
              />

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{proj.title}</h4>
                <p className="text-[10px] text-[#a39a88] truncate mt-0.5">{proj.tagline}</p>
              </div>

              {/* Status badge */}
              <div className="flex-shrink-0">
                <span className="text-[10px] font-black text-amber-500">{proj.filled}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
