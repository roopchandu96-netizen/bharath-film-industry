import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Search, Landmark, ExternalLink, Download, FileText, Send, AlertCircle } from 'lucide-react';

interface DistributorDashboardProps {
  user: User;
}

const DistributorDashboard: React.FC<DistributorDashboardProps> = ({ user }) => {
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
  const [offerType, setOfferType] = useState('Theatrical Release');
  const [minGuarantee, setMinGuarantee] = useState(50000000);
  const [revenueShare, setRevenueShare] = useState(15);
  const [bids, setBids] = useState<any[]>([]);

  const completedProjects: any[] = [];

  const handlePlaceBid = (movieId: string) => {
    setActiveMovieId(movieId);
  };

  const submitBid = (e: React.FormEvent) => {
    e.preventDefault();
    const movie = completedProjects.find(m => m.id === activeMovieId);
    const newBid = {
      movie: movie?.title,
      type: offerType,
      mg: minGuarantee,
      revShare: revenueShare,
      date: new Date().toLocaleDateString(),
      status: 'PENDING_APPROVAL'
    };
    setBids([newBid, ...bids]);
    alert(`Acquisition bid of ₹${minGuarantee.toLocaleString('en-IN')} for "${movie?.title}" has been successfully broadcast to directors & producers.`);
    setActiveMovieId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-200">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Available Films', val: completedProjects.length, icon: '🎞️', color: 'text-amber-500' },
          { label: 'My Acquisition Bids', val: bids.length + ' Active', icon: '📝', color: 'text-blue-500' },
          { label: 'Verified Channel', val: 'Distributor Node', icon: '🛡️', color: 'text-green-500' },
          { label: 'Total Placed Value', val: bids.length > 0 ? `₹${minGuarantee.toLocaleString('en-IN')}` : '0', icon: '💰', color: 'text-purple-500' }
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
        {/* Film Listings for Distributors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif text-white">Film Catalog for Acquisition</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Browse completed BFI productions seeking distribution</p>
              </div>
            </div>

            <div className="space-y-4">
              {completedProjects.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs border border-zinc-900 border-dashed rounded-2xl">
                  No completed film productions seeking distribution.
                </div>
              ) : (
                completedProjects.map(movie => (
                  <div key={movie.id} className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">{movie.title}</h4>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Director: {movie.director}</p>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">{movie.duration} • {movie.genre}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{movie.description}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full font-black tracking-wider uppercase">{movie.status}</span>
                      <button
                        onClick={() => handlePlaceBid(movie.id)}
                        className="px-5 py-2 bg-yellow-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-yellow-400 transition-all animate-pulse"
                      >
                        Acquire Rights
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Acquisition Bid Form */}
        <div className="space-y-6">
          {activeMovieId ? (
            <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6 animate-in zoom-in duration-300">
              <div>
                <h3 className="text-lg font-serif text-white">Place Acquisition Bid</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Direct offer submission</p>
              </div>

              <form onSubmit={submitBid} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Rights Mode</label>
                  <select value={offerType} onChange={e => setOfferType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white">
                    <option>Theatrical Release</option>
                    <option>OTT Digital License</option>
                    <option>Satellite / Television rights</option>
                    <option>Overseas Distribution</option>
                    <option>All-Rights Buyout</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Minimum Guarantee Offer (INR)</label>
                  <input required type="number" value={minGuarantee} onChange={e => setMinGuarantee(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white font-mono" placeholder="e.g. 50000000" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Revenue Share Percentage (%)</label>
                  <input required type="number" min={5} max={80} value={revenueShare} onChange={e => setRevenueShare(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white font-mono" placeholder="e.g. 15" />
                </div>

                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex gap-3 text-red-400 text-[9px] leading-relaxed">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>All bids submitted through the BFI marketplace are legally binding and subject to due-diligence clearance.</p>
                </div>

                <button type="submit" className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                  <Send size={12} /> Broadcast Offer
                </button>
                <button type="button" onClick={() => setActiveMovieId(null)} className="w-full text-center text-[10px] text-zinc-500 uppercase font-black tracking-widest hover:text-white pt-2">Cancel</button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
              <div>
                <h3 className="text-lg font-serif text-white">Acquisition History</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Track submitted bids</p>
              </div>

              <div className="space-y-4">
                {bids.length === 0 ? (
                  <div className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl text-center text-xs text-zinc-500">
                    No active acquisition bids. Click "Acquire Rights" to make an offer.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bids.map((bid, i) => (
                      <div key={i} className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-white">{bid.movie}</p>
                          <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-black tracking-widest uppercase">{bid.status}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">{bid.type} • MG: ₹{(bid.mg/10000000).toFixed(2)}Cr • Rev Share: {bid.revShare}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;
