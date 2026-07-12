import React from 'react';
import { DollarSign, Plus, ArrowUpRight, Search, SlidersHorizontal, Calendar, HelpCircle } from 'lucide-react';
import { User } from '../../types';

interface MobileProducerDashboardProps {
  user: User;
}

export const MobileProducerDashboard: React.FC<MobileProducerDashboardProps> = ({
  user
}) => {
  const investors: any[] = [];
  const vendors: any[] = [];

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Active Production Banner Card */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 relative overflow-hidden shadow-lg">
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="text-2xl font-extrabold text-white font-serif">No Active Production</h2>
          <div className="text-right">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest block">Live Status</span>
            <span className="text-xs font-bold text-white font-mono mt-0.5 block">Day 0 / 0</span>
          </div>
        </div>

        <p className="text-xs text-[#a39a88]">Production Budget: ₹0</p>

        {/* Progress line */}
        <div className="mt-6">
          <div className="w-full bg-[#2a2214] h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full w-0" />
          </div>
          <div className="flex justify-between text-[8px] text-[#8c826e] font-black uppercase tracking-wider mt-1.5">
            <span className="text-amber-500">0% Funded</span>
          </div>
        </div>
      </div>

      {/* Budget section (Full Audit) */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex justify-between items-baseline">
          <h3 className="text-base font-bold text-white font-serif">Budget</h3>
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Full Audit</span>
        </div>

        <div className="space-y-3.5">
          {/* Production Design */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#a39a88]">Production Design</span>
              <span className="font-bold text-white font-mono">₹0</span>
            </div>
            <div className="w-full bg-[#2a2214] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full w-0" />
            </div>
          </div>

          {/* Cast & Talent */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#a39a88]">Cast & Talent</span>
              <span className="font-bold text-white font-mono">₹0</span>
            </div>
            <div className="w-full bg-[#2a2214] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full w-0" />
            </div>
          </div>

          {/* Post-Production */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#a39a88]">Post-Production</span>
              <span className="font-bold text-white font-mono">₹0</span>
            </div>
            <div className="w-full bg-[#2a2214] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full w-0" />
            </div>
          </div>
        </div>

        {/* Audit Details Spent/Remaining */}
        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-[#251f14] pt-4">
          <div>
            <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Spent</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">₹0</span>
          </div>
          <div>
            <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Remaining</span>
            <span className="text-lg font-bold text-amber-500 font-mono mt-0.5 block">₹0</span>
          </div>
        </div>
      </div>

      {/* Investors Section */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex justify-between items-baseline">
          <h3 className="text-base font-bold text-white font-serif">Investors</h3>
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">0 Active</span>
        </div>

        <div className="space-y-3">
          {investors.length === 0 ? (
            <div className="p-4 bg-[#0d0a06] border border-[#251f14] rounded-2xl text-center text-xs text-[#8c826e]">
              No active investors connected.
            </div>
          ) : (
            investors.map((inv, idx) => (
              <div 
                key={idx}
                className="bg-[#0d0a06] border border-[#251f14] rounded-2xl p-4 flex items-center justify-between shadow-inner"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{inv.name}</h4>
                  <p className="text-[9px] text-[#8c826e] font-black uppercase tracking-wider mt-1">{inv.type}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className={`text-xs font-bold font-mono ${inv.pending ? 'text-[#8c826e]' : 'text-white'}`}>
                    {inv.contribution}
                  </span>
                  {inv.pending ? (
                    <Calendar size={12} className="text-[#8c826e]" />
                  ) : (
                    <ArrowUpRight size={12} className="text-[#8c826e]" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button className="w-full py-3.5 bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-md mt-2">
          Add New Lead
        </button>
      </div>

      {/* Vendor Management */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white font-serif">Vendor Management</h3>
          <div className="flex items-center gap-2 text-amber-500/80">
            <button className="p-1.5 bg-[#0d0a06] border border-[#251f14] rounded-lg"><SlidersHorizontal size={12} /></button>
            <button className="p-1.5 bg-[#0d0a06] border border-[#251f14] rounded-lg"><Search size={12} /></button>
          </div>
        </div>

        {/* Vendors list */}
        <div className="space-y-3">
          {vendors.length === 0 ? (
            <div className="p-4 bg-[#0d0a06] border border-[#251f14] rounded-2xl text-center text-xs text-[#8c826e]">
              No active vendors listed.
            </div>
          ) : (
            vendors.map((vendor, idx) => (
              <div 
                key={idx}
                className="bg-[#0d0a06] border border-[#251f14] rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{vendor.name}</h4>
                  <p className="text-[9px] text-[#8c826e] font-black uppercase tracking-wider mt-1">
                    {vendor.type} &nbsp;|&nbsp; {vendor.value}
                  </p>
                </div>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full tracking-wider border ${
                  vendor.status === 'Active'
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                    : 'bg-[#8c826e]/10 border-[#8c826e]/30 text-[#8c826e]'
                }`}>
                  {vendor.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Financial Reporting */}
      <div className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-6 space-y-6 shadow-lg">
        <h3 className="text-base font-bold text-white font-serif">Financial Reporting</h3>

        <div className="grid grid-cols-2 gap-4 border-b border-[#251f14] pb-4">
          <div>
            <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Burn Rate (Weekly)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white font-mono">₹0</span>
            </div>
          </div>
          <div>
            <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Liquidity Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-amber-500 font-mono">0 / 10</span>
            </div>
          </div>
        </div>

        <button className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-md">
          Generate Quarterly Report
        </button>
      </div>

      {/* Floating Action Button (FAB) */}
      <button className="fixed bottom-20 right-6 z-[60] w-14 h-14 bg-gradient-to-tr from-amber-500 to-yellow-500 text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
        <Plus size={24} className="stroke-[3]" />
      </button>
    </div>
  );
};
