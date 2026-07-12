import React from 'react';
import { Award, Wallet, Plus, Send, Compass, Eye, ShieldAlert, TrendingUp, Download } from 'lucide-react';
import { User } from '../../types';

interface MobileWriterDashboardProps {
  user: User;
  onOpenSubmission?: () => void;
}

export const MobileWriterDashboard: React.FC<MobileWriterDashboardProps> = ({
  user,
  onOpenSubmission
}) => {
  const registeredScripts: any[] = [];

  return (
    <div className="space-y-6 pb-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white leading-none font-serif">Writer Dashboard</h2>
        <p className="text-xs text-[#a39a88] mt-2">
          Welcome back, {user.name || 'Writer'}. Your scripts are active in the marketplace.
        </p>
      </div>

      {/* Estimated Earnings Card */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 relative shadow-lg">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Estimated Earnings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">₹0</span>
            </div>
          </div>
          <button className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
            <Wallet size={18} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Royalties Info */}
        <div className="mt-4 pt-4 border-t border-[#251f14] flex justify-between text-xs">
          <span className="text-[#a39a88]">Royalties</span>
          <span className="font-bold text-white font-mono">₹0</span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={onOpenSubmission}
          className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center h-28 shadow-sm active:scale-95 transition-transform"
        >
          <div className="text-amber-500"><Plus size={20} className="stroke-[2.5]" /></div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-white block leading-none">Register Story</span>
            <span className="text-[7px] text-[#8c826e] font-bold block leading-tight">Secure IP</span>
          </div>
        </button>

        <button className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center h-28 shadow-sm active:scale-95 transition-transform">
          <div className="text-amber-500"><Send size={20} className="stroke-[2.5]" /></div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-white block leading-none">Pitch Producer</span>
            <span className="text-[7px] text-[#8c826e] font-bold block leading-tight">Send Materials</span>
          </div>
        </button>

        <button className="bg-[#16120a] border border-[#2e2617] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center h-28 shadow-sm active:scale-95 transition-transform">
          <div className="text-amber-500"><Compass size={20} className="stroke-[2.5]" /></div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-white block leading-none">Marketplace</span>
            <span className="text-[7px] text-[#8c826e] font-bold block leading-tight">Browse Open</span>
          </div>
        </button>
      </div>

      {/* Registered Scripts Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold tracking-wide">My Registered Scripts</h3>
          <button className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {registeredScripts.length === 0 ? (
            <div className="p-6 bg-[#16120a] border border-[#2e2617] rounded-3xl text-center text-xs text-[#a39a88]">
              No registered scripts found. Click "Register Story" to secure your IP.
            </div>
          ) : (
            registeredScripts.map((script) => (
              <div 
                key={script.id}
                className="bg-[#16120a] border border-[#2e2617] rounded-3xl overflow-hidden shadow-md"
              >
                {/* Graphic Banner */}
                <div className="h-28 relative bg-black">
                  <img 
                    src={script.image} 
                    alt={script.title} 
                    className="w-full h-full object-cover opacity-35 mix-blend-luminosity"
                  />
                  <span className="absolute top-4 left-4 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Award size={10} />
                    {script.status}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white font-serif">{script.title}</h4>
                      <p className="text-xs text-[#a39a88] mt-1">{script.tagline}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#8c826e] font-bold">{script.code}</span>
                  </div>

                  <p className="text-xs text-[#a39a88] italic font-semibold">
                    {script.interest ? script.interest : script.regTime}
                  </p>

                  {/* Primary triggers */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#251f14]">
                    {script.pitchable ? (
                      <button className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all">
                        Pitch Now
                      </button>
                    ) : (
                      <button className="px-6 py-2.5 bg-transparent border border-[#2e2617] text-[#eae3d2] font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all">
                        Manage Rights
                      </button>
                    )}
                    
                    <button className="p-2.5 bg-[#0d0a06] border border-[#251f14] text-amber-500 rounded-xl active:scale-95 transition-all">
                      <Download size={14} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
