
import React, { useState, useEffect } from 'react';
import { User, Investment, MovieProject } from '../types';
import { CURRENCY_FORMATTER } from '../constants';
import { getUserInvestments } from '../services/investmentService';
import { getProjectById } from '../services/projectService';
import { downloadInvestmentAgreement } from '../services/fileService';
import { supabase } from '../services/firebase';
import {
  LayoutDashboard, Search, PieChart, FileText, Bell, User as UserIcon,
  Loader2, TrendingUp, Calendar, BadgeCheck, Download, ExternalLink, Filter
} from 'lucide-react';
import { notifyInvestmentInterest } from '../services/notificationService';

interface InvestorDashboardProps {
  user: User;
  onProjectSelect?: (project: MovieProject) => void;
}

const InvestorDashboard: React.FC<InvestorDashboardProps> = ({ user, onProjectSelect }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [investments, setInvestments] = useState<(Investment & { project?: MovieProject })[]>([]);
  const [allProjects, setAllProjects] = useState<MovieProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Investments
        const invs = await getUserInvestments(user.id);
        const detailedInvs = await Promise.all(invs.map(async inv => {
          const project = await getProjectById(inv.projectId);
          return { ...inv, project: project || undefined };
        }));
        setInvestments(detailedInvs);

        // Fetch All Active Projects for Browse
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'ACTIVE');
        if (projects) setAllProjects(projects as MovieProject[]);

      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleDownloadAgreement = async (inv: Investment, project?: MovieProject) => {
    if (!project) return;
    setDownloadingId(inv.id);
    await downloadInvestmentAgreement(inv, project);
    setDownloadingId(null);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'browse', label: 'Browse Projects', icon: Search },
    { id: 'investments', label: 'My Investments', icon: PieChart },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0);
  const activeCount = new Set(investments.map(i => i.projectId)).size;

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-yellow-400" /></div>;

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] gap-6 animate-in fade-in">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest ${activeView === item.id
              ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
              : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 min-h-[600px] relative overflow-hidden">

        {/* Dashboard Overview */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-white mb-1">Portfolio Snapshot</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Real-time Asset Performance</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-yellow-500">
                  <TrendingUp size={20} />
                  <span className="text-[10px] bg-yellow-400/10 px-2 py-1 rounded text-yellow-400 font-black uppercase tracking-widest">Total Deployed</span>
                </div>
                <p className="text-4xl font-black text-white tracking-tighter">{CURRENCY_FORMATTER.format(totalInvested)}</p>
              </div>
              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-green-500">
                  <FileText size={20} />
                  <span className="text-[10px] bg-green-900/20 px-2 py-1 rounded text-green-400 font-black uppercase tracking-widest">Active Contracts</span>
                </div>
                <p className="text-4xl font-black text-white tracking-tighter">{activeCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Browse Projects */}
        {activeView === 'browse' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif text-white mb-1">Marketplace</h2>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Vetted Investment Opportunities</p>
              </div>
              <button className="p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white"><Filter size={16} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allProjects.map(project => (
                <div key={project.id} className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-yellow-400/50 transition-all cursor-pointer" onClick={() => onProjectSelect?.(project)}>
                  <div className="aspect-video relative">
                    <img src={project.posterUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                      <p className="text-xs text-zinc-400 italic">Directed by {project.director}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-zinc-500">
                        <span>Funding Status</span>
                        <span className="text-yellow-400">{Math.round((project.currentFunding / project.fundingGoal) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${(project.currentFunding / project.fundingGoal) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-zinc-400 font-mono">Goal: {CURRENCY_FORMATTER.format(project.fundingGoal)}</span>
                      <span className="px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest rounded-full">View Details</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Investments */}
        {activeView === 'investments' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-white mb-1">My Investments</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Detailed Ledger</p>
            </div>
            <div className="space-y-4">
              {investments.map(inv => (
                <div key={inv.id} className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex items-center justify-between group hover:border-yellow-400/20 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={inv.project?.posterUrl} className="w-12 h-16 object-cover rounded-lg bg-zinc-950" />
                    <div>
                      <h4 className="font-bold text-white">{inv.project?.title}</h4>
                      <p className="text-xs text-zinc-500">{new Date(inv.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-yellow-400 font-bold">{CURRENCY_FORMATTER.format(inv.amount)}</p>
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">{inv.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {activeView === 'documents' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-white mb-1">Legal Repository</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Contracts & Receipts</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {investments.map(inv => (
                <div key={inv.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-950 rounded-xl text-yellow-500"><FileText size={20} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Investment Agreement - {inv.project?.title}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase">Signed on {new Date(inv.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadAgreement(inv, inv.project)}
                    disabled={downloadingId === inv.id}
                    className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700"
                  >
                    {downloadingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeView === 'notifications' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-white mb-1">Notifications</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">System Alerts</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex gap-4">
                <div className="mt-1 w-2 h-2 bg-green-500 rounded-full shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Investment Verified</h4>
                  <p className="text-xs text-zinc-400 mt-1">Your investment of {CURRENCY_FORMATTER.format(totalInvested)} has been verified by BFI Admin.</p>
                  <p className="text-[10px] text-zinc-600 mt-2 uppercase">Just now</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeView === 'profile' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-white mb-1">Investor Profile</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">KYC & Account Status</p>
            </div>
            <div className="flex items-center gap-6 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
              <img src={user.photoURL} className="w-20 h-20 rounded-full bg-black border border-zinc-700" />
              <div>
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <p className="text-sm text-zinc-500">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/20 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-500/30">
                    <BadgeCheck size={10} /> KYC Verified
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-900/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-yellow-500/30">
                    Accredited Investor
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-[2rem] space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-white">Private Client Support</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Exclusive Investor Concierge</p>
                </div>
                <div className="space-y-4">
                  <a
                    href="https://wa.me/919652919968"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl transition-all shadow-lg hover:shadow-green-900/20 group"
                  >
                    <span className="flex items-center gap-3 font-bold uppercase tracking-wide text-xs">
                      <span className="text-xl">💬</span> WhatsApp Concierge
                    </span>
                    <ExternalLink size={16} className="opacity-50 group-hover:opacity-100" />
                  </a>
                  <a
                    href="mailto:bharathfilmindustry@gmail.com"
                    className="flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-2xl transition-all"
                  >
                    <span className="flex items-center gap-3 font-bold uppercase tracking-wide text-xs">
                      📧 Institutional Mail
                    </span>
                  </a>
                </div>
              </div>

              <div className="p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center text-yellow-400 mb-2">
                  <UserIcon size={24} />
                </div>
                <h3 className="text-white font-bold">Account Manager</h3>
                <p className="text-xs text-zinc-500 px-8">Your dedicated BFI portfolio manager is available Mon-Fri, 9AM - 6PM IST.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InvestorDashboard;
