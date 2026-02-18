
import React, { useState, useEffect } from 'react';
import { 
  Users, Zap, Shield, ChevronLeft, MessageCircle, 
  Sparkles, Globe, Film, TrendingUp, Loader2, Award, Clock, Lock, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { UserRole, Syndicate, ForumThread } from '../types';
import { getThreads, getSyndicates, getDirectors, DirectorProfile } from '../services/communityService';

type LoungeView = 'MAIN' | 'SYNDICATES' | 'FORUM' | 'DIRECTORS';

interface CommunityViewProps {
  userRole: UserRole;
}

const CommunityView: React.FC<CommunityViewProps> = ({ userRole }) => {
  const [view, setView] = useState<LoungeView>('MAIN');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [syndicates, setSyndicates] = useState<Syndicate[]>([]);
  const [directors, setDirectors] = useState<DirectorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubThreads = getThreads(setThreads);
    const unsubSyndicates = getSyndicates(setSyndicates);
    const unsubDirectors = getDirectors((data) => {
      setDirectors(data);
      setLoading(false);
    });
    return () => { unsubThreads(); unsubSyndicates(); unsubDirectors(); };
  }, []);

  const renderMainLounge = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 max-w-2xl mx-auto">
      <div className="space-y-1 text-center">
        <h2 className="text-4xl font-serif gold-gradient">BFI Lounge</h2>
        <p className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold">Institutional Networking Terminal</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setView('SYNDICATES')} className="p-8 rounded-[2.5rem] bg-zinc-950 border border-yellow-400/20 group hover:border-yellow-400 transition-all text-left relative overflow-hidden shadow-2xl">
          <Zap size={24} className="text-yellow-400 mb-2" />
          <h4 className="text-sm font-black uppercase text-white">Syndicate Hub</h4>
          <p className="text-[9px] text-yellow-400/50 mt-1 font-bold">{syndicates.length} Live Bidding Pools</p>
        </button>
        <button onClick={() => setView('FORUM')} className="p-8 rounded-[2.5rem] bg-zinc-950 border border-yellow-400/10 group hover:border-yellow-400 transition-all text-left shadow-2xl">
          <MessageCircle size={24} className="text-zinc-600 group-hover:text-yellow-400 mb-2" />
          <h4 className="text-sm font-black uppercase text-zinc-500 group-hover:text-white">Public Forums</h4>
          <p className="text-[9px] text-zinc-700 mt-1 font-bold">{threads.length} Open Discussions</p>
        </button>
      </div>

      <div className="p-10 rounded-[3rem] bg-zinc-950 border border-yellow-400/10 shadow-3xl space-y-8 text-center">
         <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 mx-auto">
           <ShieldAlert size={40} />
         </div>
         <div className="space-y-4">
           <h3 className="text-2xl font-serif text-white">Private Networking Restricted</h3>
           <p className="text-zinc-500 text-xs max-w-md mx-auto leading-relaxed uppercase font-black tracking-widest">
             To protect the integrity of the BFI Strategic Bridge and prevent collusion, direct peer-to-peer messaging between Producers and Directors is strictly prohibited.
           </p>
         </div>
         <div className="flex justify-center gap-6">
           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600"><Lock size={12}/> Regulatory Shield</div>
           {/* Fixed: Added ShieldCheck to lucide-react imports above to resolve the missing name error */}
           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600"><ShieldCheck size={12}/> Escrow Integrity</div>
         </div>
         <div className="pt-8 border-t border-zinc-900">
           <p className="text-[10px] text-zinc-700 italic">Please utilize Syndicate Hubs for project-specific bidding and transparent communication.</p>
         </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto min-h-[500px]">
       {view === 'MAIN' ? renderMainLounge() : (
         <div className="space-y-6 animate-in fade-in">
           <button onClick={() => setView('MAIN')} className="flex items-center gap-2 text-yellow-400 text-[10px] font-black uppercase hover:translate-x-1 transition-all"><ChevronLeft size={16} /> Return to Lounge Hub</button>
           <div className="py-40 text-center space-y-6 bg-zinc-950/50 rounded-[3rem] border border-zinc-900">
             <Loader2 className="animate-spin text-yellow-400 mx-auto" size={32} />
             <div className="space-y-1">
               <p className="text-[10px] uppercase font-black tracking-[0.4em] text-yellow-400">Connecting to BFI Cluster</p>
               <p className="text-[8px] uppercase font-bold text-zinc-700">Verifying {view} Access Tokens...</p>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default CommunityView;
