import React, { useState, useEffect } from 'react';
import { Film, Plus, Play, Briefcase, DollarSign, Users, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import { User, MovieProject } from '../../types';
import { supabase } from '../../services/firebase';

interface MobileDirectorDashboardProps {
  user: User;
  onOpenSubmission?: () => void;
}

export const MobileDirectorDashboard: React.FC<MobileDirectorDashboardProps> = ({
  user,
  onOpenSubmission
}) => {
  const [productions, setProductions] = useState<MovieProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('directorId', user.id)
          .order('created_at', { ascending: false });
        if (data) {
          setProductions(data as MovieProject[]);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductions();
  }, [user.id]);

  const tools = [
    { name: 'Pitch Deck Management', icon: Film },
    { name: 'Budget Planning Tools', icon: DollarSign },
    { name: 'Casting Management', icon: Users },
    { name: 'Script Revisions', icon: FileText }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white leading-none font-serif">
          Welcome back, {user.role === 'DIRECTOR' ? 'Director' : user.name}
        </h2>
        <p className="text-xs text-[#a39a88] mt-2">Your creative empire is flourishing.</p>
      </div>

      {/* Create Film Project Trigger Button */}
      <button 
        onClick={onOpenSubmission}
        className="w-full py-4.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-lg shadow-yellow-500/10"
      >
        <Plus size={16} className="stroke-[2.5]" />
        Create Film Project
      </button>

      {/* Active Productions Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold tracking-wide">Active Productions</h3>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-6 text-xs text-[#8c826e]">Loading productions...</div>
          ) : productions.length === 0 ? (
            <div className="bg-[#16120a] border border-[#2e2617] border-dashed rounded-3xl p-6 text-center text-xs text-[#a39a88]">
              No active productions listed.
            </div>
          ) : (
            productions.map((prod) => {
              const progress = prod.fundingGoal > 0 ? Math.round((prod.currentFunding / prod.fundingGoal) * 100) : 0;
              return (
                <div 
                  key={prod.id}
                  className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-5 relative shadow-md space-y-4"
                >
                  {/* Header Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-white font-serif">{prod.title}</h4>
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1 block">
                        {prod.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-[#a39a88] font-bold">
                      <span>Funding Progress</span>
                      <span className="text-white font-mono">{progress}%</span>
                    </div>
                    <div className="w-full bg-[#2a2214] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Footer info inside card */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#251f14]">
                    <span className="text-[10px] text-[#a39a88] font-semibold">Budget: ₹{(prod.budget || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Studio Tools Grid */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold tracking-wide">Studio Tools</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div 
                key={tool.name}
                className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-5 flex flex-col justify-between h-32 shadow-md cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                  <Icon size={18} className="stroke-[2.5]" />
                </div>
                <h4 className="text-xs font-black uppercase text-white leading-tight mt-4 tracking-wider">
                  {tool.name}
                </h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funding Market Pulse (Live) */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Funding Market Pulse</h3>
          </div>
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Live</span>
        </div>

        <div className="bg-[#0d0a06] border border-[#251f14] rounded-2xl p-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#16120a] border border-[#2e2617] rounded-xl flex items-center justify-center text-amber-500">
              <RefreshCw size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Decentralized Fund V</h4>
              <p className="text-[9px] text-[#8c826e] font-mono mt-0.5">Current Pool: 1,402 ETH</p>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-transparent border border-[#2e2617] text-amber-500 font-black text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all">
            Pitch
          </button>
        </div>
      </div>
    </div>
  );
};
