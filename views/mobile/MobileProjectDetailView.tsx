import React, { useState } from 'react';
import { ArrowLeft, Share2, Play, Plus, ChevronRight, Coins, FileText, Flag, Ban } from 'lucide-react';
import { MovieProject } from '../../types';

interface MobileProjectDetailViewProps {
  project: MovieProject;
  onBack: () => void;
  onInvest?: (amount: number) => void;
}

export const MobileProjectDetailView: React.FC<MobileProjectDetailViewProps> = ({
  project,
  onBack,
  onInvest
}) => {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [investAmount, setInvestAmount] = useState(500000); // Default ₹5.0 L (500,000)

  const subTabs = ['Overview', 'Financials', 'Creative Team', 'Reviews'];

  const handleReport = () => {
    window.alert('Content has been flagged for review. Our moderation team will investigate within 24 hours.');
  };

  const handleBlock = () => {
    if (window.confirm(`Are you sure you want to block ${project.director || 'this user'}? You will no longer see their content.`)) {
      window.alert('User blocked successfully.');
    }
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

  // Formatting helpers
  const formatLakhs = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(1)} Cr`;
    }
    return `₹${(val / 100000).toFixed(1)} L`;
  };

  // Calculations based on slider
  const estRevShare = project.budget && Number(project.budget) > 0 
    ? ((investAmount / Number(project.budget)) * 100).toFixed(4)
    : '0.0000';

  return (
    <div className="space-y-6 pb-12">
      {/* Detail Header navigation */}
      <div className="flex items-center justify-between border-b border-[#251f14] pb-3">
        <button onClick={onBack} className="flex items-center gap-1 text-amber-500 font-bold active:scale-95 transition-transform">
          <ArrowLeft size={18} className="stroke-[2.5]" />
          Back
        </button>
        <span className="text-xs font-black uppercase text-[#8c826e] tracking-widest">Opportunity Details</span>
        <button className="p-2 text-amber-500/80 hover:text-amber-500 active:scale-90 transition-transform">
          <Share2 size={16} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Hero Banner Area */}
      <div className="h-56 relative rounded-3xl overflow-hidden bg-black border border-[#2e2617] shadow-lg flex flex-col justify-end p-6">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-65 mix-blend-screen"
          style={{ backgroundImage: `url(${project.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Content Overlay */}
        <div className="relative space-y-2">
          <div className="flex gap-2">
            <span className="bg-amber-500 text-black text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
              {project.genre || 'Film'}
            </span>
          </div>

          <h3 className="text-2xl font-extrabold text-white leading-tight font-serif uppercase tracking-wide">
            {project.title}
          </h3>

          <p className="text-xs text-[#a39a88] leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>

      {/* Action Play & Add Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md">
          <Play size={14} className="fill-black stroke-none" />
          Watch Trailer
        </button>
        <button className="p-3.5 bg-[#16120a] border border-[#2e2617] text-amber-500 rounded-2xl active:scale-95 transition-transform">
          <Plus size={18} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-3 gap-3 bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 text-center shadow-md">
        <div>
          <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Funding</span>
          <span className="text-sm font-extrabold text-amber-500 block mt-1 font-mono">
            {project.fundingGoal > 0 ? Math.round((project.currentFunding / project.fundingGoal) * 100) : 0}%
          </span>
        </div>
        <div className="border-x border-[#251f14]">
          <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Investors</span>
          <span className="text-sm font-extrabold text-white block mt-1 font-mono">{project.investorCount || 0}</span>
        </div>
        <div>
          <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Status</span>
          <span className="text-sm font-extrabold text-[#60a5fa] block mt-1 font-mono uppercase">{project.status}</span>
        </div>
      </div>

      {/* Detail Sub Tabs */}
      <div className="flex gap-4 border-b border-[#251f14] pb-1 overflow-x-auto flex-nowrap scrollbar-hide">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3 px-1 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
              activeSubTab === tab 
                ? 'text-amber-500 border-b-2 border-amber-500' 
                : 'text-[#8c826e] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview content */}
      {activeSubTab === 'Overview' && (
        <div className="space-y-6">
          {/* Story Synopsis */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Story Synopsis</h4>
            <p className="text-xs text-[#a39a88] leading-relaxed">
              {project.description}
            </p>
            {project.scriptUrl && (
              <button
                onClick={() => window.open(project.scriptUrl, '_blank')}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl text-[10px] font-extrabold text-black uppercase tracking-widest shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <FileText size={14} /> Read Script Document
              </button>
            )}
          </div>

          {/* Key Creative Team */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Key Creative Team</h4>
              <div className="flex gap-3">
                <button onClick={handleReport} className="text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1 text-[9px] uppercase tracking-widest font-black" title="Report Content">
                  <Flag size={12} /> Report
                </button>
                <button onClick={handleBlock} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-[9px] uppercase tracking-widest font-black" title="Block User">
                  <Ban size={12} /> Block
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Director */}
              <div 
                onClick={() => handleBFIContact(project.director || 'BFI Director', `Director of ${project.title}`)}
                className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:border-amber-500/50 transition-colors"
                title="Request Connection via BFI"
              >
                <div 
                  className="w-10 h-10 rounded-xl bg-cover bg-center border border-[#251f14] flex-shrink-0 flex items-center justify-center text-amber-500 text-lg font-bold bg-amber-500/10"
                >
                  📞
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">{project.director || 'BFI Director'}</h5>
                  <span className="text-[8px] text-[#8c826e] font-bold uppercase tracking-wider block mt-0.5">Director (Request Connection)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Budget Breakdown</h4>
              <div className="text-right">
                <span className="text-[9px] text-[#8c826e] font-bold uppercase tracking-wider">Total Budget: </span>
                <span className="text-xs font-extrabold text-white font-mono">₹{(project.budget || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Raised progress bar */}
            <div>
              <div className="w-full bg-[#2a2214] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" 
                  style={{ width: `${project.fundingGoal > 0 ? Math.min(100, Math.round((project.currentFunding / project.fundingGoal) * 100)) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-[#8c826e] font-bold uppercase tracking-wider mt-1.5">
                <span>₹{(project.currentFunding || 0).toLocaleString('en-IN')} Raised</span>
                <span className="text-amber-500">{project.fundingGoal > 0 ? Math.round((project.currentFunding / project.fundingGoal) * 100) : 0}%</span>
              </div>
            </div>
          </div>

          {/* Personal Investment Section */}
          <div className="bg-[#16120a] border border-[#eab308]/20 rounded-3xl p-6 space-y-6 shadow-lg">
            <h4 className="text-sm font-bold text-white tracking-wide">Personal Investment</h4>

            {/* Slider header */}
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-black uppercase text-[#8c826e] tracking-widest">Amount to Invest</span>
              <span className="text-xl font-extrabold text-amber-500 font-mono">{formatLakhs(investAmount)}</span>
            </div>

            {/* Custom slider input */}
            <div className="space-y-1">
              <input 
                type="range"
                min="50000"
                max="10000000"
                step="50000"
                value={investAmount}
                onChange={(e) => setInvestAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-[#2a2214] rounded-lg appearance-none cursor-pointer accent-amber-500 outline-none"
              />
              <div className="flex justify-between text-[8px] text-[#8c826e] font-black uppercase tracking-wider">
                <span>₹50K</span>
                <span>₹100L+</span>
              </div>
            </div>

            {/* Return Estimates Table */}
            <div className="grid grid-cols-2 gap-4 border-t border-[#251f14] pt-4">
              <div>
                <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Est. Revenue Share</span>
                <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">{estRevShare}%</span>
              </div>
              <div>
                <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Projected ROI (12m)</span>
                <span className="text-sm font-extrabold text-amber-500 block mt-0.5">18-24%</span>
              </div>
            </div>

            <p className="text-[8px] text-[#8c826e] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <Coins size={10} className="text-amber-500" />
              Based on mid-tier box-office projections.
            </p>

            {/* Invest Trigger */}
            <button 
              onClick={() => onInvest && onInvest(investAmount)}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:from-amber-300 hover:to-yellow-400 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Coins size={14} className="stroke-[2.5]" />
              Invest Now
            </button>
            <p className="text-[8px] text-zinc-600 leading-relaxed text-center px-1">
              Disclaimer: Film investments carry significant risk, including partial or total loss of principal. Projected ROI is an estimate and not guaranteed. Please review our full terms before participating. By proceeding, you acknowledge these risks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
