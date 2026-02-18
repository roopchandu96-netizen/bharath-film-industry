import React, { useState, useEffect } from 'react';
import { MovieProject, AIProbabilityResult } from '../types.ts';
import { CURRENCY_FORMATTER, TIERS } from '../constants.ts';
import {
  ChevronLeft, Play, ShieldCheck, Loader2,
  TrendingUp, Award, Zap, FileText,
  Map, Activity, CheckCircle2, ExternalLink
} from 'lucide-react';
import { analyzeMovieSuccess, getGenreMarketPulse } from '../services/geminiService.ts';
import { notifyInvestmentInterest } from '../services/notificationService.ts';

interface ProjectDetailViewProps {
  project: MovieProject;
  onBack: () => void;
  onInvest?: (amount: number) => void;
  onPlayTrailer: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack, onInvest, onPlayTrailer }) => {
  const [investAmount, setInvestAmount] = useState<number>(100000);
  const [aiResult, setAiResult] = useState<AIProbabilityResult | null>(null);
  const [marketPulse, setMarketPulse] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const getAiAnalysis = async () => {
      setLoadingAi(true);
      try {
        const [res, pulse] = await Promise.all([
          analyzeMovieSuccess(project),
          getGenreMarketPulse(project.genre)
        ]);
        setAiResult(res);
        setMarketPulse(pulse);
      } catch (e) {
        console.error("AI Analysis failed:", e);
      } finally {
        setLoadingAi(false);
      }
    };
    getAiAnalysis();
  }, [project]);

  const milestones = [
    { label: "Synopsis & Character Bible", status: "COMPLETED", pct: 100 },
    { label: "Pre-Production (Casting/Loc)", status: "IN_PROGRESS", pct: 45 },
    { label: "Principal Photography", status: "PENDING", pct: 0 },
    { label: "VFX & Post-Production", status: "PENDING", pct: 0 },
    { label: "Marketing & Theatrical Release", status: "PENDING", pct: 0 }
  ];

  const recentBids = [
    { user: "P. Sharma", amount: "₹50,00,000", time: "2h ago", tier: "Associate" },
    { user: "KV Rao", amount: "₹1,25,00,000", time: "5h ago", tier: "Co-Producer" },
    { user: "Anonymous", amount: "₹10,00,000", time: "1d ago", tier: "Supporter" }
  ];

  const selectedTier = TIERS.find(t => investAmount >= t.min && investAmount <= t.max) || TIERS[TIERS.length - 1];

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-zinc-900/50 border border-yellow-400/20 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Market List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-zinc-900 shadow-2xl border border-yellow-400/10 group">
            <img src={project.posterUrl} className="w-full h-full object-cover opacity-30 blur-sm group-hover:scale-110 group-hover:blur-0 transition-all duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={onPlayTrailer} className="w-24 h-24 bg-yellow-400 text-black border-4 border-black/20 rounded-full flex items-center justify-center group transition-all hover:scale-110 hover:bg-yellow-300 shadow-[0_0_50px_rgba(250,204,21,0.5)]">
                <Play fill="currentColor" className="ml-1.5" size={48} />
              </button>
            </div>
            <div className="absolute bottom-10 left-10 right-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest mb-4">
                <FileText size={12} /> Bidding BFI Node
              </div>
              <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight drop-shadow-2xl">{project.title}</h1>
            </div>
          </div>

          <div className="p-10 bg-yellow-400/5 rounded-[3rem] border border-yellow-400/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Zap size={200} className="text-yellow-400" /></div>
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-yellow-400 uppercase tracking-widest flex items-center gap-3"><TrendingUp size={20} /> Intellect Analysis</h3>
                {loadingAi && <Loader2 className="animate-spin text-yellow-400" size={20} />}
              </div>
              {!loadingAi && aiResult && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <span className="text-7xl font-black gold-gradient tracking-tighter">{aiResult.score}%</span>
                    <span className="text-[10px] text-yellow-400/40 font-black uppercase tracking-widest">Market Viability</span>
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-lg text-yellow-100/80 italic border-l-4 border-yellow-400/40 pl-8 font-serif leading-relaxed mb-4">"{aiResult.rationale}"</p>
                    {marketPulse && (
                      <div className="flex items-start gap-2 bg-black/40 p-3 rounded-xl border border-yellow-400/10">
                        <Activity size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80">{marketPulse}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 space-y-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <Map className="text-yellow-400" size={20} />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Production Roadmap</h3>
            </div>
            <div className="space-y-6">
              {milestones.map((m, i) => (
                <div key={i} className="relative pl-10">
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center border ${m.status === 'COMPLETED' ? 'bg-green-500/20 border-green-500 text-green-500' : m.status === 'IN_PROGRESS' ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 animate-pulse' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}>
                    {m.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <span className="text-[8px] font-black">{i + 1}</span>}
                  </div>
                  {i < milestones.length - 1 && <div className="absolute left-3 top-6 w-px h-6 bg-zinc-800" />}
                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${m.status === 'PENDING' ? 'text-zinc-600' : 'text-zinc-300'}`}>{m.label}</span>
                    <span className="text-[9px] font-bold text-zinc-600">{m.pct}% Deployment</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Official Synopsis</h3>
                <div className="h-px w-12 bg-zinc-900" />
              </div>
              <button
                onClick={() => {
                  // Create a temporary text file and trigger download
                  const element = document.createElement("a");
                  const file = new Blob([`PROJECT SYNOPSIS: ${project.title}\n\nTAGLINE: ${project.tagline}\n\nGENRE: ${project.genre}\n\nDIRECTOR: ${project.director}\n\nSYNOPSIS:\n${project.description}`], { type: 'text/plain' });
                  element.href = URL.createObjectURL(file);
                  element.download = `${project.title.replace(/\s+/g, '_')}_Synopsis.txt`;
                  document.body.appendChild(element); // Required for this to work in FireFox
                  element.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-all"
              >
                <ExternalLink size={12} /> Download PDF
              </button>
            </div>
            <p className="text-zinc-300 text-base leading-relaxed font-serif tracking-wide whitespace-pre-wrap">{project.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-zinc-900">
              <div><span className="text-[9px] font-black text-zinc-500 uppercase">Director</span><p className="text-sm font-bold text-white">{project.director}</p></div>
              <div><span className="text-[9px] font-black text-zinc-500 uppercase">Budget</span><p className="text-sm font-bold text-white">{CURRENCY_FORMATTER.format(project.budget)}</p></div>
              <div><span className="text-[9px] font-black text-zinc-500 uppercase">Registry ID</span><p className="text-sm font-bold text-yellow-400">BFI-{project.id.slice(-8).toUpperCase()}</p></div>
              <div><span className="text-[9px] font-black text-zinc-500 uppercase">Status</span><p className="text-sm font-bold text-green-500">{project.status}</p></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="sticky top-24 space-y-10">
            <div className="p-10 rounded-[3.5rem] bg-zinc-950 border border-yellow-400/20 shadow-3xl space-y-10">
              <div className="space-y-1">
                <h2 className="text-xs font-black uppercase tracking-widest text-yellow-400">Current Market Bid</h2>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black tracking-tighter text-white">{CURRENCY_FORMATTER.format(project.currentFunding)}</p>
                  <span className="text-[9px] text-zinc-600 mb-2 font-black uppercase">Raised</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black uppercase">
                  <span className="text-zinc-500">Target: {CURRENCY_FORMATTER.format(project.fundingGoal)}</span>
                  <span className="text-yellow-400">{Math.round((project.currentFunding / project.fundingGoal) * 100)}%</span>
                </div>
                <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-yellow-400/10 p-[3px]">
                  <div className="h-full bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6)]" style={{ width: `${Math.min((project.currentFunding / project.fundingGoal) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-zinc-950 border border-zinc-900 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-zinc-700" size={14} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Recent Bid Activity</h3>
              </div>
              <div className="space-y-4">
                {recentBids.map((bid, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-900/50 last:border-0">
                    <div>
                      <p className="text-[11px] font-black text-zinc-400 uppercase">{bid.user}</p>
                      <p className="text-[8px] font-bold text-zinc-600">{bid.time} • {bid.tier} Tier</p>
                    </div>
                    <p className="text-xs font-black text-yellow-400">{bid.amount}</p>
                  </div>
                ))}
              </div>
            </div>

            {onInvest ? (
              <div className="p-10 rounded-[3.5rem] bg-zinc-950 border border-zinc-800 shadow-3xl space-y-10">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-serif gold-gradient">Deploy Capital</h3>
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Open Market Transaction</p>
                </div>
                <div className="space-y-6">
                  <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 focus-within:border-yellow-400/60 transition-all">
                    <span className="text-zinc-600 text-[9px] font-black uppercase">Bid Amount (INR)</span>
                    <input type="number" value={investAmount} onChange={(e) => setInvestAmount(Number(e.target.value))} className="bg-transparent text-3xl font-black text-white w-full outline-none mt-2" />
                  </div>
                  <div className="p-6 rounded-3xl bg-yellow-400/5 border border-yellow-400/10 flex items-start gap-5">
                    <Award size={28} className="text-yellow-400" />
                    <div><h4 className="text-xs font-black text-yellow-400 uppercase">{selectedTier?.name}</h4><p className="text-[11px] text-zinc-400">{selectedTier?.perk}</p></div>
                  </div>

                  <button onClick={() => {
                    // Notify Bank Transfer Interest
                    notifyInvestmentInterest("Anonymous Investor", project.title, investAmount, "BANK_TRANSFER");
                    onInvest(investAmount);
                  }} className="w-full py-6 rounded-2xl bg-yellow-400 text-black font-black uppercase shadow-2xl hover:bg-yellow-300 transition-all">
                    Invest Now (Secure Escrow)
                  </button>

                  <a
                    href={`https://wa.me/919652919968?text=Hello%20BFI,%20I%20am%20interested%20in%20investing%20INR%20${investAmount}%20in%20project:%20${project.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => notifyInvestmentInterest("Anonymous Investor", project.title, investAmount, "WHATSAPP")}
                    className="w-full py-6 rounded-2xl bg-green-600 text-white font-black uppercase shadow-2xl hover:bg-green-500 transition-all flex items-center justify-center gap-2"
                  >
                    <p className="text-sm">Contact BFI WhatsApp (Cash/Query)</p>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-[3.5rem] bg-zinc-900/30 border border-zinc-800 border-dashed text-center space-y-4">
                <ShieldCheck size={32} className="mx-auto text-zinc-700" />
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Node Management Mode</h3>
                <p className="text-[10px] text-zinc-700 uppercase font-black tracking-widest leading-relaxed">
                  As the director of this bidding node, you can monitor capital flow. Investment capabilities are restricted to producer-grade sessions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;