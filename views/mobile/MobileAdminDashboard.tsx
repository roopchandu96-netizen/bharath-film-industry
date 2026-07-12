import React from 'react';
import { Shield, Users, Landmark, AlertTriangle, RefreshCw, CheckCircle, Lock, ArrowUpRight } from 'lucide-react';
import { User } from '../../types';

interface MobileAdminDashboardProps {
  user: User;
}

export const MobileAdminDashboard: React.FC<MobileAdminDashboardProps> = ({ user }) => {
  const stats = [
    { label: 'Total TVL', value: '₹8.42 Cr', change: '+12.4% vs last week', active: true },
    { label: 'Active Escrows', value: '142', change: '98.2% Auto-match' },
    { label: 'User Queue', value: '56', change: '12 Urgent Reviews', alert: true },
    { label: 'Fraud Alerts', value: '02', change: 'Neutralized' }
  ];

  const verificationQueue = [
    { name: 'Arjun Malhotra', role: 'PRODUCER', docId: 'DOC_ID: 9823-XA-21', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200' },
    { name: 'Deepa Nair', role: 'DIRECTOR', docId: 'DOC_ID: 1140-ZZ-09', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' }
  ];

  const escrows = [
    { project: "Project 'Vikram'", phase: 'PHASE: PRE-PRODUCTION', amount: '₹45.5 L', status: 'Locked' },
    { project: 'Neon Skies', phase: 'PHASE: POST', amount: '₹12.0 L', status: 'Distributed' }
  ];

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
      {/* Quick Stats Grid */}
      <div className="space-y-4">
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            className={`border rounded-[2rem] p-5 shadow-md relative overflow-hidden backdrop-blur-xl ${
              stat.active 
                ? 'bg-emerald-950/60 border-yellow-500/25 ring-1 ring-yellow-500/10' 
                : 'bg-emerald-950/40 border-yellow-500/10'
            }`}
          >
            <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest block">{stat.label}</span>
            <span className="text-2xl font-extrabold text-white font-mono mt-1.5 block">{stat.value}</span>
            <span className={`text-[9px] font-bold mt-1.5 block ${
              stat.alert ? 'text-rose-400 font-extrabold' : stat.active ? 'text-[#FACC15]' : 'text-emerald-400/70'
            }`}>
              {stat.alert ? '⚠ ' : stat.active ? '↗ ' : ''}{stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Verification Queue Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white font-serif tracking-wide">Verification Queue</h3>
          <button className="text-[10px] font-black uppercase text-[#FACC15] tracking-wider">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {verificationQueue.map((item, idx) => (
            <div 
              key={idx}
              className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[1.8rem] p-4 flex items-center gap-4 shadow-sm"
            >
              <div 
                className="w-11 h-11 rounded-xl bg-cover bg-center border border-yellow-500/15"
                style={{ backgroundImage: `url(${item.avatar})` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                  <span className="bg-[#021f18] border border-yellow-500/25 text-[#FACC15] text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {item.role}
                  </span>
                </div>
                <p className="text-[9px] text-emerald-400/80 font-mono mt-1">{item.docId}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escrow Monitoring */}
      <div className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[2.2rem] p-6 space-y-4 shadow-lg">
        <h3 className="text-base font-bold text-white font-serif">Escrow Monitoring</h3>
        
        <div className="space-y-3.5">
          {escrows.map((esc, idx) => (
            <div key={idx} className="flex justify-between items-center pb-3 border-b border-yellow-500/5 last:border-b-0 last:pb-0">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{esc.project}</h4>
                <span className="text-[8px] font-black text-emerald-400/80 uppercase tracking-widest mt-1 block">{esc.phase}</span>
              </div>
              
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-xs font-bold text-white font-mono">{esc.amount}</span>
                <span className={`text-[8px] font-black px-2.5 py-1 rounded-full tracking-wider uppercase flex items-center gap-1 ${
                  esc.status === 'Locked'
                    ? 'bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15]'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${esc.status === 'Locked' ? 'bg-[#FACC15]' : 'bg-emerald-500'}`} />
                  {esc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Distro */}
      <div className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[2.2rem] p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-baseline">
          <h3 className="text-base font-bold text-white font-serif">Revenue Distro</h3>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-xs text-emerald-400">Pool Total</span>
          <span className="text-2xl font-extrabold text-white font-mono">₹1.2 Cr</span>
        </div>

        {/* Custom stacked horizontal progress bar */}
        <div className="w-full bg-[#021f18] h-2.5 rounded-full flex overflow-hidden">
          <div className="bg-[#FACC15] h-full w-[65%]" />
          <div className="bg-blue-500 h-full w-[25%]" />
          <div className="bg-zinc-600 h-full w-[10%]" />
        </div>

        {/* Breakdown details */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FACC15]" />
              <span className="text-[#FFFBEB]/70">Investors</span>
            </div>
            <span className="font-bold text-white font-mono">65%</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[#FFFBEB]/70">Platform Fee</span>
            </div>
            <span className="font-bold text-white font-mono">25%</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-[#FFFBEB]/70">Reserves</span>
            </div>
            <span className="font-bold text-white font-mono">10%</span>
          </div>
        </div>

        <button className="w-full py-4 bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] font-extrabold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-md border-none cursor-pointer">
          Trigger Distribution
        </button>
      </div>

      {/* Fraud Engine */}
      <div className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[2.2rem] p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-950 border border-yellow-500/15 rounded-2xl flex items-center justify-center text-[#FACC15]">
            <Shield size={20} className="stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-white font-serif">Fraud Engine</h3>
        </div>

        <div className="space-y-3 bg-[#021f18]/60 border border-yellow-500/5 rounded-2xl p-4 shadow-inner">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#FFFBEB]/70">Pattern Matching</span>
            <span className="text-emerald-400 font-bold uppercase">Active</span>
          </div>
          <div className="flex justify-between text-xs font-semibold border-t border-yellow-500/5 pt-3">
            <span className="text-[#FFFBEB]/70">IP Anomalies</span>
            <span className="text-[#FACC15] font-bold uppercase">Clear</span>
          </div>
          <div className="border-t border-yellow-500/5 pt-3 text-[10px] text-rose-400 font-extrabold flex items-center gap-1.5">
            <AlertTriangle size={12} className="stroke-[2.5]" />
            High Volume attempt detected from VPN
          </div>
        </div>
      </div>

      {/* Node Status */}
      <div className="bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl rounded-[2.2rem] p-6 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest block">Node Status</span>
          <h4 className="text-base font-bold text-white font-serif mt-1">Node 0x-Alpha</h4>
          <span className="text-[9px] text-[#FFFBEB]/50 font-mono mt-0.5 block">Processing Block #5,121</span>
        </div>

        {/* Circular Progress Dial */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="26" stroke="#021f18" strokeWidth="4" fill="transparent" />
            <circle 
              cx="32" cy="32" r="26" stroke="#FACC15" strokeWidth="4" fill="transparent" 
              strokeDasharray="163.3" strokeDashoffset="13" // 92% of circumference
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold text-white font-mono">92%</span>
        </div>
      </div>
    </div>
  );
};
