
import React, { useState, useEffect } from 'react';
import { User, Investment, MovieProject } from '../types';
import { CURRENCY_FORMATTER } from '../constants';
import { getUserInvestmentsWithProjects } from '../services/investmentService';
import { getProjectById } from '../services/projectService';
import { downloadInvestmentAgreement } from '../services/fileService';
import { supabase } from '../services/firebase';
import {
  LayoutDashboard, Search, PieChart, FileText, Bell, User as UserIcon,
  Loader2, TrendingUp, Calendar, BadgeCheck, Download, ExternalLink, Filter, Scale
} from 'lucide-react';
import { notifyInvestmentInterest } from '../services/notificationService';
import { UserAgreements } from './UserAgreements';

interface InvestorDashboardProps {
  user: User;
  onProjectSelect?: (project: MovieProject) => void;
  initialView?: string;
}

const StatCardSkeleton = () => (
  <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 bg-zinc-800 rounded" />
      <div className="w-24 h-4 bg-zinc-800 rounded" />
    </div>
    <div className="w-36 h-8 bg-zinc-800/60 rounded" />
  </div>
);

const ProjectCardSkeleton = () => (
  <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 flex flex-col justify-between animate-pulse min-h-[350px]">
    <div className="aspect-video bg-zinc-800/60" />
    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="w-3/4 h-5 bg-zinc-800/60 rounded" />
        <div className="w-1/2 h-3 bg-zinc-800/60 rounded" />
        <div className="w-full h-10 bg-zinc-800/40 rounded mt-2" />
      </div>
      <div className="space-y-2">
        <div className="h-1.5 bg-zinc-850 rounded-full overflow-hidden" />
        <div className="flex justify-between items-center">
          <div className="w-1/3 h-4 bg-zinc-800/60 rounded" />
          <div className="w-16 h-6 bg-zinc-800/60 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const NotificationSkeleton = () => (
  <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-2 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="w-1/3 h-4 bg-zinc-800/60 rounded" />
      <div className="w-16 h-3 bg-zinc-800/60 rounded" />
    </div>
    <div className="w-full h-3 bg-zinc-800/60 rounded" />
    <div className="w-5/6 h-3 bg-zinc-800/60 rounded" />
  </div>
);

const InvestorDashboard: React.FC<InvestorDashboardProps> = ({ user, onProjectSelect, initialView = 'dashboard' }) => {
  const [activeView, setActiveView] = useState(initialView);
  const [investments, setInvestments] = useState<(Investment & { project?: MovieProject })[]>([]);
  const [allProjects, setAllProjects] = useState<MovieProject[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setInvestmentsLoading(true);
        const detailedInvs = await getUserInvestmentsWithProjects(user.id);
        setInvestments(detailedInvs);
      } catch (err) {
        console.error("Investments fetch error:", err);
      } finally {
        setInvestmentsLoading(false);
      }
    };

    const fetchActiveProjects = async () => {
      try {
        setProjectsLoading(true);
        // Use ilike for case-insensitive status matching (DB may store 'ACTIVE' or 'active')
        const { data: projects } = await supabase
          .from('projects')
          .select('id, title, tagline, genre, budget, fundingGoal, currentFunding, investorCount, director, status, posterUrl, description, scriptUrl, "scriptFileName"')
          .in('status', ['ACTIVE', 'APPROVED', 'active', 'approved']);
        if (projects) setAllProjects(projects as MovieProject[]);
      } catch (err) {
        console.error("Projects fetch error:", err);
      } finally {
        setProjectsLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const { data: notifs } = await supabase
          .from('notifications')
          .select('id, recipient, title, message, read, created_at')
          .eq('recipient', user.email)
          .order('created_at', { ascending: false });
        if (notifs) {
          setNotifications(notifs);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Notifications fetch error:", err);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchInvestments();
    fetchActiveProjects();
    fetchNotifications();

    // Realtime subscription: auto-refresh when projects change (e.g. newly approved)
    const channel = supabase
      .channel('investor_projects')
      .on('postgres_changes', { event: '*', table: 'projects', schema: 'public' }, () => {
        fetchActiveProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, user.email]);

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
            {investmentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
            ) : (
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
            )}

            {/* Bidding Scripts (Active Projects) Available for Investment */}
            <div className="space-y-6 pt-8 border-t border-zinc-900">
              <div>
                <h3 className="text-xl font-serif text-white mb-1">Active Bidding Scripts</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Select a synopsis to evaluate and deploy capital</p>
              </div>

              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProjectCardSkeleton />
                  <ProjectCardSkeleton />
                </div>
              ) : allProjects.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-3xl text-zinc-600">
                  No scripts are currently available for investment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allProjects.map(project => (
                    <div key={project.id} className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-yellow-400/50 transition-all cursor-pointer flex flex-col justify-between" onClick={() => onProjectSelect?.(project)}>
                      <div className="aspect-video relative">
                        <img src={project.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80"} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h4 className="text-lg font-bold text-white leading-tight">{project.title}</h4>
                          <p className="text-[10px] text-zinc-400 italic">Directed by {project.director}</p>
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{project.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] uppercase font-black tracking-widest text-zinc-500">
                            <span>Funding Status</span>
                            <span className="text-yellow-400">{Math.round((project.currentFunding / project.fundingGoal) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400" style={{ width: `${(project.currentFunding / project.fundingGoal) * 100}%` }} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1.5">
                          <span className="text-[10px] text-zinc-400 font-mono">Goal: {CURRENCY_FORMATTER.format(project.fundingGoal)}</span>
                          <span className="px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest rounded-full group-hover:bg-yellow-300 transition-all">Evaluate</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            {investmentsLoading ? (
              <div className="space-y-4">
                <div className="h-16 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
                <div className="h-16 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
                <div className="h-16 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
              </div>
            ) : investments.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-3xl text-zinc-600">
                You have not deployed capital to any projects yet.
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Documents */}
        {activeView === 'documents' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-serif text-white mb-1">Legal Repository</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Contracts & Receipts</p>
            </div>

            {/* Legal Repository Policy Framework Card */}
            <div className="bg-zinc-950/80 border border-yellow-500/10 p-6 md:p-8 rounded-[2rem] space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
              <div className="flex items-center gap-3">
                <span className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl"><Scale size={20} /></span>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">Legal Repository Policy</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Contracts &amp; Receipts for Investors</p>
                </div>
              </div>
              
              <div className="text-xs text-slate-400 leading-relaxed space-y-4 max-h-[320px] overflow-y-auto pr-2 border-t border-zinc-800/80 pt-4">
                <p><strong>Purpose:</strong> The Legal Repository serves as the official storage and verification system for all investor agreements, transactions, and project-related legal documents conducted through Bharat Film Industry (BFI).</p>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-yellow-500 tracking-wider">Documents Maintained for Every Investor:</p>
                  <ul className="list-decimal pl-5 space-y-2 text-xs">
                    <li><strong>Investor Registration Form:</strong> Contains investor's full name, contact info, address, identity verification details, preferences, signature, and consent.</li>
                    <li><strong>Investor Agreement:</strong> Legally executed contract between BFI, the Investor, and Project Producer outlining investment amount, revenue sharing terms, risk disclosure, rights, and exit clauses.</li>
                    <li><strong>Investment Receipt:</strong> Issued receipt containing receipt number, investor name, project name, amount invested, date of payment, payment method, and BFI signature.</li>
                    <li><strong>Payment Acknowledgement:</strong> Confirmation that investment funds have been received and recorded.</li>
                    <li><strong>Revenue Distribution Records:</strong> Film revenue statements, sources, investor share calculations, dates, and outstanding balances.</li>
                    <li><strong>Tax Documentation:</strong> TDS certificates, tax deduction records, and compliance documents where applicable.</li>
                    <li><strong>Project Updates Archive:</strong> Access to official production updates, shooting logs, post-production progress, and release status.</li>
                    <li><strong>Legal Notices &amp; Amendments:</strong> Contract amendments, budget revisions, delays, and official communications.</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] font-black uppercase text-white tracking-widest mb-1.5">Digital Record Policy</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">All contracts, receipts, and acknowledgements are digitally stored by BFI, protected via secure access controls, and retained for a minimum period required by law.</p>
                  </div>
                  <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] font-black uppercase text-white tracking-widest mb-1.5">Investor Transparency Policy</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">BFI is committed to providing investors with verified investment records, transaction receipts, revenue-sharing statements, and official project communications.</p>
                  </div>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-[10px] text-zinc-500 leading-normal">
                  <strong>Disclaimer:</strong> BFI acts as a facilitator connecting investors and film projects. Investment returns are not guaranteed and depend entirely on the commercial performance and revenue generated by the respective film project. All investors acknowledge inherent risks before participating.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {investmentsLoading ? (
                <>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse h-16 bg-zinc-900/50" />
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse h-16 bg-zinc-900/50" />
                </>
              ) : investments.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-600 text-xs">
                  No agreements available.
                </div>
              ) : (
                investments.map(inv => (
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
                ))
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeView === 'notifications' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-serif text-white mb-1">Notifications</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">System Alerts</p>
            </div>
            {notificationsLoading ? (
              <div className="space-y-4">
                <NotificationSkeleton />
                <NotificationSkeleton />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl text-zinc-600">
                No alerts or notifications at this time.
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((n) => (
                  <div key={n.id} className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-3xl flex gap-4 items-start">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-zinc-700' : 'bg-yellow-500 animate-pulse'}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white leading-snug">{n.subject || n.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 whitespace-pre-wrap leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-zinc-600 mt-2.5 font-mono uppercase">
                        {new Date(n.created_at || n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    href="mailto:bharatfilmindustry@gmail.com"
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
