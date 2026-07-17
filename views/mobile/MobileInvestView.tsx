import React, { useState, useEffect } from 'react';
import { Shield, Landmark, TrendingUp, Info, HelpCircle, Coins, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';
import { MovieProject, User, Investment } from '../../types';
import { getUserInvestments } from '../../services/investmentService';

interface MobileInvestViewProps {
  user: User;
  onSelectProject: (project: MovieProject) => void;
}

export const MobileInvestView: React.FC<MobileInvestViewProps> = ({
  user,
  onSelectProject
}) => {
  const [calcAmount, setCalcAmount] = useState<number>(100000); // 1 Lakh default
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const data = await getUserInvestments(user.id);
        setInvestments(data);
      } catch (err) {
        console.error("Error fetching investments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, [user.id]);

  const totalInvestedAmount = investments.reduce((acc, curr) => acc + curr.amount, 0);
  const activeEscrowsCount = investments.length;

  // Est ROI potentials
  const minROI = Math.round(calcAmount * 1.18);
  const maxROI = Math.round(calcAmount * 1.24);

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white leading-tight font-serif">BFI Treasury</h2>
        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Smart Escrow & Capital Management</p>
      </div>

      {/* Investment Overview Card */}
      <div className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[2.2rem] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#FACC15]/5 rounded-full blur-2xl pointer-events-none" />
        
        <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest block">Total Invested Capital</span>
        <div className="flex items-baseline gap-2.5 mt-1">
          <span className="text-3xl font-extrabold text-white font-mono leading-none">₹{totalInvestedAmount.toLocaleString('en-IN')}</span>
        </div>

        {/* Horizontal Mini stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-yellow-500/5">
          <div>
            <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-widest block">Active Escrows</span>
            <span className="text-xl font-bold text-[#FFFBEB] font-mono mt-0.5 block">{activeEscrowsCount} Nodes</span>
          </div>
          <div>
            <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-widest block">Producer Class</span>
            <span className="text-xl font-bold text-[#FACC15] uppercase tracking-wider mt-0.5 block font-serif">
              {totalInvestedAmount >= 50000000 ? 'Tier IV' : totalInvestedAmount >= 5000000 ? 'Tier III' : totalInvestedAmount >= 1000000 ? 'Tier II' : 'Tier I'}
            </span>
          </div>
        </div>

        {/* Profit Distribution Gold SVG Bar Chart */}
        {totalInvestedAmount > 0 && (
          <div className="mt-6 pt-5 border-t border-yellow-500/5">
            <span className="text-[8px] font-black text-emerald-400/80 uppercase tracking-widest block mb-4">
              Profit Distribution Yields (6 Months)
            </span>
            <div className="h-28 flex items-end justify-between px-2 bg-emerald-950/30 rounded-2xl p-4 border border-yellow-500/5">
              {[25, 40, 52, 68, 60, 92].map((height, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className="w-4 bg-emerald-950 h-20 flex items-end relative rounded-t-sm overflow-hidden border border-yellow-500/5">
                    <div 
                      style={{ height: `${height}%` }}
                      className="w-full bg-gradient-to-t from-[#FACC15] via-[#eab308] to-[#f59e0b] rounded-t-sm shadow-[0_0_10px_rgba(250,204,21,0.25)]"
                    />
                  </div>
                  <span className="text-[8px] text-emerald-400/60 font-mono mt-1">M{idx+1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ROI Calculator Widget */}
      <div className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[2.2rem] p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FACC15]/10 rounded-xl flex items-center justify-center text-[#FACC15]">
            <Calculator size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Yield Simulator</h3>
            <p className="text-[9px] text-emerald-400/70 font-bold uppercase">Simulate your cinematic dividends</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-[#FFFBEB]/70">Investment Principal:</span>
            <span className="text-[#FACC15] font-mono font-bold">₹{calcAmount.toLocaleString('en-IN')}</span>
          </div>
          
          <input 
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={calcAmount}
            onChange={(e) => setCalcAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#FACC15]"
          />

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-yellow-500/5">
            <div className="bg-[#021f18]/60 p-3 rounded-xl border border-yellow-500/5 text-center">
              <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-widest block">Est Return (18%)</span>
              <span className="text-xs font-mono font-bold text-white mt-1 block">₹{minROI.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-[#021f18]/60 p-3 rounded-xl border border-yellow-500/5 text-center">
              <span className="text-[8px] font-black text-[#FACC15] uppercase tracking-widest block">Est Return (24%)</span>
              <span className="text-xs font-mono font-bold text-[#FACC15] mt-1 block">₹{maxROI.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Escrows List */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase text-[#FACC15] tracking-widest block px-1">Active Escrow Vaults</h3>
        
        <div className="space-y-3">
          {investments.length === 0 ? (
            <div className="bg-emerald-950/20 border border-yellow-500/5 backdrop-blur-md rounded-[1.8rem] p-6 text-center text-xs text-[#8f9b88]">
              No active escrow vaults found.
            </div>
          ) : (
            investments.map((inv) => (
              <div 
                key={inv.id}
                className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-md rounded-[1.8rem] p-5 shadow-md space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white font-serif">{inv.project || 'Bidding Node'}</h4>
                    <span className="text-[9px] text-[#FFFBEB]/50 block mt-0.5">Escrow Contract Active</span>
                  </div>
                  <span className="text-xs font-black text-[#FACC15] font-mono">₹{inv.amount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-yellow-500/5 text-[9px] font-black uppercase tracking-wider">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={12} className="stroke-[2.5] text-[#FACC15]" />
                    {inv.status === 'VERIFIED' ? 'Escrow Released' : 'Escrow Locked'}
                  </div>
                  <span className="text-emerald-400">{inv.tier} Tier</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Community TVL Pool Card */}
      <div className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[2.2rem] p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FACC15]/10 rounded-xl flex items-center justify-center text-[#FACC15]">
              <Landmark size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Syndicate Pool</h3>
              <p className="text-[9px] text-emerald-400/70 font-bold uppercase">Decentralized Indie Film Funding</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-emerald-400/90 leading-relaxed">
          Deploy capital into the collective reserve pool for audited indie creators. Systemic revenue sharing across all projects in the portfolio automatically.
        </p>

        <div className="flex justify-between items-center pt-2">
          <div>
            <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-widest block">Pool TVL</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">₹45.20 Cr</span>
          </div>
          <button className="px-5 py-2.5 bg-transparent border border-yellow-500/20 text-[#FACC15] hover:bg-[#FACC15]/10 active:scale-95 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all">
            Join the Pool
          </button>
        </div>
      </div>
    </div>
  );
};
