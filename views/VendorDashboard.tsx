import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Plus, Search, Calendar, Landmark, Settings, Film, AlertTriangle } from 'lucide-react';

interface VendorDashboardProps {
  user: User;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user }) => {
  const [gearName, setGearName] = useState('');
  const [category, setCategory] = useState('Camera');
  const [dailyRate, setDailyRate] = useState(15000);
  const [vendorGear, setVendorGear] = useState<any[]>([]);

  const handleAddGear = (e: React.FormEvent) => {
    e.preventDefault();
    const newGear = {
      id: String(vendorGear.length + 1),
      name: gearName,
      category,
      dailyRate,
      status: 'AVAILABLE'
    };
    setVendorGear([newGear, ...vendorGear]);
    alert(`${gearName} has been listed in the BFI rental catalog.`);
    setGearName('');
    setDailyRate(10000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-200">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Equipment Listed', val: vendorGear.length + ' Items', icon: '📹', color: 'text-amber-500' },
          { label: 'Booking Request', val: '1 Pending', icon: '📅', color: 'text-blue-500' },
          { label: 'Verification Rate', val: '100%', icon: '🛡️', color: 'text-green-500' },
          { label: 'Monthly Earnings', val: '₹0', icon: '💰', color: 'text-purple-500' }
        ].map((m, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{m.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{m.val}</h3>
            </div>
            <span className="text-3xl">{m.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listed Equipment Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif text-white">Equipment Catalog</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Listed cameras, drones, lights, and rigs</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <Search size={14} className="text-zinc-500" />
                <input placeholder="Search gear..." className="bg-transparent border-0 outline-none text-xs text-white" />
              </div>
            </div>

            <div className="space-y-4">
              {vendorGear.map(gear => (
                <div key={gear.id} className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Film size={16} /></span>
                      <h4 className="text-sm font-bold text-white">{gear.name}</h4>
                      <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500">{gear.category}</span>
                    </div>
                    <p className="text-xs text-slate-400">Daily Rental: <strong className="text-yellow-500">₹{gear.dailyRate.toLocaleString('en-IN')} / Day</strong></p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      gear.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {gear.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Gear Form */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
            <div>
              <h3 className="text-lg font-serif text-white">List Rental Gear</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Broadcast gear availability</p>
            </div>

            <form onSubmit={handleAddGear} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Equipment Name / Model</label>
                <input required value={gearName} onChange={e => setGearName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white font-bold" placeholder="e.g. DJI Inspire 3 Drone" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white">
                  <option>Camera</option>
                  <option>Lighting</option>
                  <option>Sound Gear</option>
                  <option>Drone / Gimbal</option>
                  <option>Production Vehicle</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Daily Base Rate (INR)</label>
                <input required type="number" value={dailyRate} onChange={e => setDailyRate(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white font-mono" placeholder="e.g. 15000" />
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3 text-blue-400 text-[10px] leading-relaxed">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <p>All items in the BFI network are covered by standard commercial transit insurance.</p>
              </div>

              <button type="submit" className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                List Equipment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
