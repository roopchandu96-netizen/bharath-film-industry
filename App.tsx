
import React, { useState, useEffect } from 'react';
import { supabase } from './services/firebase.ts';
import { syncUserToFirestore } from './services/userService.ts';
import { createProject } from './services/projectService.ts';
import { notifyNewSynopsis } from './services/notificationService.ts';
import Layout from './components/Layout.tsx';
import ExploreView from './views/ExploreView.tsx';
import InvestorDashboard from './views/InvestorDashboard.tsx';
import AuthView from './views/AuthView.tsx';
import ProfileView from './views/ProfileView.tsx';
import ProjectDetailView from './views/ProjectDetailView.tsx';
import AboutView from './views/AboutView.tsx';
import OurWorksView from './views/OurWorksView.tsx';
import TermsView from './views/TermsView.tsx';
import { MovieBookingView } from './views/MovieBookingView.tsx';
import PaymentGateway from './components/PaymentGateway.tsx';
import BFIIntellect from './components/BFIIntellect.tsx';
import { BFILogo } from './components/BFILogo.tsx';
import AdminDashboard from './views/AdminDashboard.tsx';
import DirectorDashboard from './views/DirectorDashboard.tsx';
import WriterDashboard from './views/WriterDashboard.tsx';
import ActorDashboard from './views/ActorDashboard.tsx';
import CrewDashboard from './views/CrewDashboard.tsx';
import VendorDashboard from './views/VendorDashboard.tsx';
import DistributorDashboard from './views/DistributorDashboard.tsx';
import ServiceProviderDashboard from './views/ServiceProviderDashboard.tsx';
import StudentDashboard from './views/StudentDashboard.tsx';
import ProducerDashboard from './views/ProducerDashboard.tsx';
import PostsView from './views/PostsView.tsx';
import { UserRole, MovieProject, User } from './types.ts';
import { Loader2, X, Globe, Film, AlignLeft, Tag, UploadCloud, Menu } from 'lucide-react';

import { MobileLayout } from './components/MobileLayout.tsx';
import { MobileHomeView } from './views/mobile/MobileHomeView.tsx';
import { MobileDiscoverView } from './views/mobile/MobileDiscoverView.tsx';
import { MobileInvestView } from './views/mobile/MobileInvestView.tsx';
import { MobileProjectDetailView } from './views/mobile/MobileProjectDetailView.tsx';
import { MobileAuthView } from './views/mobile/MobileAuthView.tsx';
import { MobileWriterDashboard } from './views/mobile/MobileWriterDashboard.tsx';
import { MobileDirectorDashboard } from './views/mobile/MobileDirectorDashboard.tsx';
import { MobileProducerDashboard } from './views/mobile/MobileProducerDashboard.tsx';
import { MobileAdminDashboard } from './views/mobile/MobileAdminDashboard.tsx';



const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};


const App: React.FC = () => {
  const isMobile = useIsMobile();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [loggedOutTab, setLoggedOutTab] = useState<'about' | 'works' | 'terms' | 'posts' | 'booking'>('booking');
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<MovieProject | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investmentRequest, setInvestmentRequest] = useState<{ project: MovieProject; amount: number } | null>(null);
  const [investorDashboardView, setInvestorDashboardView] = useState('dashboard');

  const [newProject, setNewProject] = useState({
    title: '',
    logline: '',
    genre: 'Action/Thriller',
    budget: 50000000,
    fundingGoal: 25000000,
    synopsis: '',
    previousWorks: '',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    teaserUrl: ''
  });
  const [scriptFileName, setScriptFileName] = useState('');
  const [posterFileName, setPosterFileName] = useState('');
  const [isScriptRegistered, setIsScriptRegistered] = useState(false);
  const [acceptedDirectorTerms, setAcceptedDirectorTerms] = useState(false);

  useEffect(() => {
    // Safety Force Load: In case onAuthStateChange never fires or hangs
    const globalTimeout = setTimeout(() => {
      console.warn("App: Auth global timeout reached. Forcing load.");
      setAuthLoading(false);
    }, 12000);

    let legacySession: any = null;
    try {
      const legacySessionStr = localStorage.getItem('bfi_legacy_session');
      if (legacySessionStr) {
        legacySession = JSON.parse(legacySessionStr);
      }
    } catch (e) {
      console.error("Failed to parse legacy session from storage:", e);
    }

    if (legacySession && legacySession.user) {
      setSession(legacySession);
      const fallbackRole = legacySession.user.user_metadata?.role || UserRole.INVESTOR;
      setUser({
        id: legacySession.user.id,
        email: legacySession.user.email,
        name: legacySession.user.user_metadata?.full_name || 'Legacy User',
        role: fallbackRole,
        kycStatus: 'VERIFIED',
        totalInvested: 0,
        projects: []
      });
      if (fallbackRole === UserRole.ADMIN) setActiveTab('admin');
      else if (fallbackRole === UserRole.INVESTOR) setActiveTab('explore');
      else setActiveTab('portfolio');
      
      setAuthLoading(false);
      clearTimeout(globalTimeout);
      return () => clearTimeout(globalTimeout);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth State Changed. User Email:", session?.user?.email);

      // Race Condition Handler: Ensure loading stops
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject("Auth Timeout"), 10000));

      try {
        if (session?.user) {
          setSession(session);
          console.log("Fetching user profile from database...");

          // Race the profile sync against a 10s timeout
          const userData = await Promise.race([
            syncUserToFirestore(session.user),
            timeoutPromise
          ]) as User;

          console.log("User Profile Fetched:", userData);
          setUser(userData);

          // Logic to set initial tab based on role
          if (userData.role === UserRole.ADMIN) {
            console.log("User is ADMIN. Setting tab to 'admin'");
            setActiveTab('admin');
          } else if (userData.role === UserRole.INVESTOR) {
            console.log("User is INVESTOR. Setting tab to 'explore'");
            setActiveTab('explore');
          } else {
            console.log(`User is ${userData.role}. Setting tab to 'portfolio'`);
            setActiveTab('portfolio');
          }
        } else {
          console.log("No active session. Resetting state.");
          setUser(null);
          setSession(null);
          setActiveTab('explore');
        }
      } catch (err) {
        console.error("CRITICAL: Failed to fetch user profile or Timeout:", err);
        // Fallback to prevent blank screen
        if (session?.user) {
          const fallbackRole = session.user.user_metadata?.role || UserRole.INVESTOR;
          console.warn("Using Fallback Role due to error:", fallbackRole);

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || 'User (Offline)',
            role: fallbackRole,
            kycStatus: 'PENDING',
            totalInvested: 0,
            projects: []
          });

          // Set tab based on fallback role
          if (fallbackRole === UserRole.ADMIN) {
            setActiveTab('admin');
          } else if (fallbackRole === UserRole.INVESTOR) {
            setActiveTab('explore');
          } else {
            setActiveTab('portfolio');
          }
        }
      } finally {
        setAuthLoading(false);
        clearTimeout(globalTimeout);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(globalTimeout);
    };
  }, []);

  const handleProjectSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isScriptRegistered) {
      alert("Validation Error: Under BFI terms, you must confirm that the screenplay is officially registered.");
      return;
    }
    if (!acceptedDirectorTerms) {
      alert("Validation Error: You must read and accept the BFI Director Terms & Conditions before listing.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Append Previous Works to description if exists
      let finalDescription = newProject.synopsis;
      if (newProject.previousWorks.trim()) {
        finalDescription += `\n\n--- Previous Works ---\n${newProject.previousWorks}`;
      }

      await createProject({
        title: newProject.title,
        tagline: newProject.logline,
        genre: newProject.genre,
        budget: newProject.budget,
        fundingGoal: newProject.fundingGoal,
        description: finalDescription,
        posterUrl: newProject.posterUrl,
        teaserUrl: newProject.teaserUrl,
        director: user.name,
        status: 'PENDING',
        investorCount: 0,
        currentFunding: 0,
      });
      notifyNewSynopsis(user.name, newProject.title);
      setIsProjectModalOpen(false);

      // Reset form states
      setNewProject({
        title: '',
        logline: '',
        genre: 'Action/Thriller',
        budget: 50000000,
        fundingGoal: 25000000,
        synopsis: '',
        previousWorks: '',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
        teaserUrl: ''
      });
      setScriptFileName('');
      setPosterFileName('');
      setIsScriptRegistered(false);
      setAcceptedDirectorTerms(false);

      alert("Screenplay listed successfully. BFI Admin has been notified for compliance verification.");
    } catch (e: any) {
      console.error(e);
      alert(`Submission failed: ${e.message || "Check network link."}`);
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-yellow-400" /></div>;
  
  if (!session || !user) {
    if (isMobile) {
      return <MobileAuthView />;
    }
    if (showAuth) {
      return (
        <div className="relative isolate">
          <button 
            onClick={() => setShowAuth(false)}
            className="absolute top-6 left-6 z-50 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            ← Back to Home
          </button>
          <AuthView />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-[#020617] overflow-x-hidden flex flex-col font-sans selection:bg-yellow-500/30 text-slate-200 relative">
        {/* Cinematic ambient background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Floating Glassmorphic Header */}
        <header className="sticky top-4 z-40 max-w-7xl mx-auto w-[92%] bg-slate-950/65 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] mt-4 px-6 h-20 flex items-center justify-between transition-all duration-300">
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <BFILogo className="w-full h-full drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-none tracking-tight">Bharat <span className="text-yellow-500">Film Industry</span></h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5 sm:block hidden">Decentralized Production</p>
              </div>
            </div>
            {/* Logged Out Navigation - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/5">
              <button
                onClick={() => setLoggedOutTab('booking')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  loggedOutTab === 'booking'
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Movie Booking
              </button>
              <button
                onClick={() => setLoggedOutTab('about')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  loggedOutTab === 'about'
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                About BFI
              </button>
              <button
                onClick={() => setLoggedOutTab('works')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  loggedOutTab === 'works'
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Our Works
              </button>
              <button
                onClick={() => setLoggedOutTab('posts')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  loggedOutTab === 'posts'
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="btn-nav-blog"
              >
                Blog & News
              </button>
              <button
                onClick={() => setLoggedOutTab('terms')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  loggedOutTab === 'terms'
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Terms
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAuth(true)} 
                className="hidden md:block px-6 py-2.5 bg-yellow-500 text-black font-bold text-xs uppercase tracking-wider rounded-full hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]"
              >
                Sign Up / Login
              </button>
              <button className="md:hidden p-2 text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Navigation Menu">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay for Logged Out User */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-black/95 pt-[calc(8rem+env(safe-area-inset-top,0px))] px-6 overflow-y-auto md:hidden backdrop-blur-md">
            <div className="flex flex-col gap-4">
              {[
                { id: 'booking', label: 'Movie Booking' },
                { id: 'about', label: 'About BFI' },
                { id: 'works', label: 'Our Works' },
                { id: 'posts', label: 'Blog & News' },
                { id: 'terms', label: 'Terms' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setLoggedOutTab(item.id as any); setMobileMenuOpen(false); }}
                  className={`flex items-center justify-center p-4 rounded-xl text-lg font-bold border ${loggedOutTab === item.id
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400'
                    }`}
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} 
                className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl shadow-lg mt-4 active:scale-95 transition-all text-center"
              >
                Sign Up / Login
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16">
          {loggedOutTab === 'booking' && <MovieBookingView user={null} />}
          {loggedOutTab === 'about' && <AboutView />}
          {loggedOutTab === 'works' && <OurWorksView />}
          {loggedOutTab === 'terms' && <TermsView />}
          {loggedOutTab === 'posts' && <PostsView />}
        </main>
        
        <footer className="bg-[#020617] border-t border-slate-900 py-12 text-center text-slate-400 text-sm space-y-4">
          <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-wider">
            <button onClick={() => setLoggedOutTab('booking')} className="hover:text-yellow-500 transition-colors">Movie Booking</button>
            <button onClick={() => setLoggedOutTab('about')} className="hover:text-yellow-500 transition-colors">About BFI</button>
            <button onClick={() => setLoggedOutTab('works')} className="hover:text-yellow-500 transition-colors">Our Works</button>
            <button onClick={() => setLoggedOutTab('posts')} className="hover:text-yellow-500 transition-colors">Blog & News</button>
            <button onClick={() => setLoggedOutTab('terms')} className="hover:text-yellow-500 transition-colors">Terms of Service</button>
          </div>
           <div>© 2026 Bharat Film Industry. All rights reserved. Built on Secured Nodes.</div>
          <div className="text-[10px] text-slate-400 tracking-wider font-mono">
            UDYAM REGISTRATION NUMBER: UDYAM-AP-23-0080757 &nbsp;|&nbsp; GSTIN: 37CZVPR2615G1ZU
          </div>
        </footer>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={user.activeRole || user.role}
        userName={user.name || 'User'}
        onOpenSubmission={() => setIsProjectModalOpen(true)}
      >
        {selectedProject ? (
          <MobileProjectDetailView
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
            onInvest={(amount) => setInvestmentRequest({ project: selectedProject, amount })}
          />
        ) : (
          <>
            {(activeTab === 'home' || activeTab === 'explore') && (
              (user.activeRole || user.role) === UserRole.ADMIN ? (
                <MobileAdminDashboard user={user} />
              ) : (
                <MobileHomeView 
                  user={user}
                  onSelectProject={setSelectedProject}
                  onOpenSubmission={() => setIsProjectModalOpen(true)}
                  onQuickInvest={(p, amount) => setInvestmentRequest({ project: p, amount })}
                />
              )
            )}
            {activeTab === 'discover' && (
              <MobileDiscoverView 
                onSelectProject={setSelectedProject} 
                onOpenSubmission={() => setIsProjectModalOpen(true)}
              />
            )}
            {(activeTab === 'invest' || activeTab === 'portfolio') && (() => {
              switch (user.activeRole || user.role) {
                case UserRole.INVESTOR:
                  return <MobileInvestView user={user} onSelectProject={setSelectedProject} />;
                case UserRole.ADMIN:
                  return <AdminDashboard user={user} />;
                case UserRole.DIRECTOR:
                  return <MobileDirectorDashboard user={user} onOpenSubmission={() => setIsProjectModalOpen(true)} />;
                case UserRole.WRITER:
                  return <MobileWriterDashboard user={user} onOpenSubmission={() => setIsProjectModalOpen(true)} />;
                case UserRole.PRODUCER:
                  return <MobileProducerDashboard user={user} />;
                case UserRole.MOVIE_LOVER:
                  return <MovieBookingView user={user} />;
                default:
                  return <MobileInvestView user={user} onSelectProject={setSelectedProject} />;
              }
            })()}
            {activeTab === 'profile' && (
              <ProfileView user={user} onUpdate={(updated) => setUser(updated)} />
            )}
             {activeTab === 'about' && (
               <AboutView />
             )}
             {activeTab === 'booking' && (
               <MovieBookingView user={user} />
             )}
           </>
         )}

        {investmentRequest && (
          <PaymentGateway
            project={investmentRequest.project}
            amount={investmentRequest.amount}
            user={user!}
            onSuccess={() => { 
              setInvestmentRequest(null); 
              setSelectedProject(null);
              setActiveTab(isMobile ? 'invest' : 'portfolio');
            }}
            onCancel={() => setInvestmentRequest(null)}
          />
        )}

        {/* Director Project Submission Modal */}
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-yellow-400/20 rounded-[3rem] shadow-3xl scrollbar-hide">
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-serif text-white">List Production Node</h2>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Broadcast registered creative assets to BFI network</p>
                  </div>
                  <button onClick={() => setIsProjectModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors"><X /></button>
                </div>

                <form onSubmit={handleProjectSubmission} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><Film size={10} /> Film Title</label>
                      <input required value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="e.g. Preema Preethi" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><Tag size={10} /> Genre</label>
                      <select value={newProject.genre} onChange={e => setNewProject(p => ({ ...p, genre: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none">
                        <option>Action/Thriller</option>
                        <option>Sci-Fi Noir</option>
                        <option>Historical Epic</option>
                        <option>Cinematic Drama</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1">Logline</label>
                    <input required value={newProject.logline} onChange={e => setNewProject(p => ({ ...p, logline: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="A brief, one-sentence summary of your film's main premise..." />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><AlignLeft size={10} /> Synopsis</label>
                    <textarea required rows={4} value={newProject.synopsis} onChange={e => setNewProject(p => ({ ...p, synopsis: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none resize-none leading-relaxed" placeholder="Detailed story outline, themes, and creative direction..." />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><UploadCloud size={10} /> Budget & Funding Goal</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input required value={newProject.budget} onChange={e => setNewProject(p => ({ ...p, budget: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="e.g. ₹5.00 Cr" />
                      <input required type="number" value={newProject.fundingGoal || ''} onChange={e => setNewProject(p => ({ ...p, fundingGoal: Number(e.target.value) }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="Funding Goal (INR)" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1">Poster URL (Optional)</label>
                    <input value={newProject.posterUrl} onChange={e => setNewProject(p => ({ ...p, posterUrl: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="https://example.com/poster.jpg" />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isScriptRegistered} onChange={e => setIsScriptRegistered(e.target.checked)} className="rounded border-zinc-800 text-yellow-500 bg-zinc-900 focus:ring-yellow-500" />
                      <span className="text-xs text-zinc-400 select-none">Screenplay is registered with Screen Writers Association (SWA)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={acceptedDirectorTerms} onChange={e => setAcceptedDirectorTerms(e.target.checked)} className="rounded border-zinc-800 text-yellow-500 bg-zinc-900 focus:ring-yellow-500" />
                      <span className="text-xs text-zinc-400 select-none">I accept the terms and condition of BFI Smart Escrow Protocols</span>
                    </label>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : null}
                    Submit Production Node
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </MobileLayout>
    );
  }

  // Logic: Only show AdminDashboard if explicitly select 'admin' tab (and user is admin)
  // This allows Directors (or Admins acting as Directors) to see the normal Layout.
  if (activeTab === 'admin' && (user.activeRole || user.role) === UserRole.ADMIN) {
    return <AdminDashboard user={user} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        if (tab !== 'portfolio') {
          setInvestorDashboardView('dashboard');
        }
      }} 
      role={user.activeRole || user.role}
    >
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onInvest={(user.activeRole || user.role) === UserRole.INVESTOR ? (amount) => setInvestmentRequest({ project: selectedProject, amount }) : undefined}
          onPlayTrailer={() => { }}
        />
      ) : (
        <>
          {activeTab === 'explore' && <ExploreView onSelectProject={setSelectedProject} onQuickInvest={(p) => setInvestmentRequest({ project: p, amount: 100000 })} user={user} onOpenSubmission={() => setIsProjectModalOpen(true)} />}

          {/* ROLE DASHBOARD LOGIC */}
          {activeTab === 'portfolio' && (() => {
            switch (user.activeRole || user.role) {
              case UserRole.DIRECTOR:
                return <DirectorDashboard user={user} onOpenSubmission={() => setIsProjectModalOpen(true)} />;
              case UserRole.INVESTOR:
                return <InvestorDashboard user={user} initialView={investorDashboardView} />;
              case UserRole.PRODUCER:
                return <ProducerDashboard user={user} />;
              case UserRole.WRITER:
                return <WriterDashboard user={user} />;
              case UserRole.ACTOR:
                return <ActorDashboard user={user} />;
              case UserRole.CREW:
                return <CrewDashboard user={user} />;
              case UserRole.VENDOR:
                return <VendorDashboard user={user} />;
              case UserRole.DISTRIBUTOR:
                return <DistributorDashboard user={user} />;
              case UserRole.SERVICE_PROVIDER:
                return <ServiceProviderDashboard user={user} />;
              case UserRole.STUDENT:
                return <StudentDashboard user={user} />;
              case UserRole.MOVIE_LOVER:
                return <MovieBookingView user={user} />;
              default:
                return <InvestorDashboard user={user} initialView={investorDashboardView} />;
            }
          })()}

           {activeTab === 'works' && <OurWorksView />}
           {activeTab === 'booking' && <MovieBookingView user={user} />}
           {activeTab === 'terms' && <TermsView />}
           {activeTab === 'profile' && <ProfileView user={user} onUpdate={(updated) => setUser(updated)} />}
           {activeTab === 'about' && <AboutView />}
           {activeTab === 'posts' && <PostsView />}
        </>
      )}

      <BFIIntellect />

      {investmentRequest && (
        <PaymentGateway
          project={investmentRequest.project}
          amount={investmentRequest.amount}
          user={user!}
          onSuccess={() => { 
            setInvestmentRequest(null); 
            setSelectedProject(null);
            // Redirect to home/dashboard tab and set view to investments!
            setActiveTab('portfolio');
            setInvestorDashboardView('investments');
          }}
          onCancel={() => setInvestmentRequest(null)}
        />
      )}

      {/* Director Project Submission Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-yellow-400/20 rounded-[3rem] shadow-3xl scrollbar-hide">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-serif text-white">List Production Node</h2>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Broadcast registered creative assets to BFI network</p>
                </div>
                <button onClick={() => setIsProjectModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors"><X /></button>
              </div>

              <form onSubmit={handleProjectSubmission} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><Film size={10} /> Film Title</label>
                    <input required value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="e.g. Preema Preethi" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><Tag size={10} /> Genre</label>
                    <select value={newProject.genre} onChange={e => setNewProject(p => ({ ...p, genre: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none">
                      <option>Action/Thriller</option>
                      <option>Sci-Fi Noir</option>
                      <option>Historical Epic</option>
                      <option>Cinematic Drama</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1">Logline</label>
                  <input required value={newProject.logline} onChange={e => setNewProject(p => ({ ...p, logline: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="A brief, one-sentence summary of your film's main premise..." />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><AlignLeft size={10} /> Synopsis</label>
                  <textarea required rows={4} value={newProject.synopsis} onChange={e => setNewProject(p => ({ ...p, synopsis: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none resize-none leading-relaxed" placeholder="Detailed story outline, themes, and creative direction..." />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1">Previous Works (If Done)</label>
                  <textarea rows={3} value={newProject.previousWorks} onChange={e => setNewProject(p => ({ ...p, previousWorks: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none resize-none leading-relaxed" placeholder="List your past films, portfolio links, or notable accolades..." />
                </div>

                {/* Script upload */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><UploadCloud size={10} /> Registered Screenplay / Script File (PDF / DOCX)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setScriptFileName(file.name); }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl py-4 px-6 text-sm text-zinc-400 group-hover:border-yellow-400/50 group-hover:text-yellow-400 transition-all flex items-center justify-center gap-2">
                      <UploadCloud size={16} />
                      <span>{scriptFileName || "Click to Upload Screenplay File"}</span>
                    </div>
                  </div>
                </div>

                {/* Script Registration Verification */}
                <div className="flex items-start gap-3 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                  <input
                    type="checkbox"
                    required
                    id="is-script-registered"
                    checked={isScriptRegistered}
                    onChange={(e) => setIsScriptRegistered(e.target.checked)}
                    className="mt-1 accent-yellow-500 rounded border-zinc-800 bg-zinc-950 w-4 h-4 focus:ring-yellow-500"
                  />
                  <label htmlFor="is-script-registered" className="text-[10px] text-zinc-400 leading-relaxed cursor-pointer select-none">
                    <strong>Registered Scripts Only:</strong> I confirm this script is officially registered with the Writers Association or Copyright Authority. Unregistered creative works are strictly prohibited under BFI policies. (Required)
                  </label>
                </div>

                {/* Poster upload */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><UploadCloud size={10} /> Movie Poster Image (Optional)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPosterFileName(file.name);
                          const localUrl = URL.createObjectURL(file);
                          setNewProject(p => ({ ...p, posterUrl: localUrl }));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl py-4 px-6 text-sm text-zinc-400 group-hover:border-yellow-400/50 group-hover:text-yellow-400 transition-all flex items-center justify-center gap-2">
                      <UploadCloud size={16} />
                      <span>{posterFileName || "Click to Upload Movie Poster (If Available)"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Poster URL (Fallback)</label>
                    <input value={newProject.posterUrl} onChange={e => setNewProject(p => ({ ...p, posterUrl: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="https://..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Teaser URL</label>
                    <input value={newProject.teaserUrl} onChange={e => setNewProject(p => ({ ...p, teaserUrl: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="https://..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Total Production Budget (INR)</label>
                    <input type="number" required value={newProject.budget} onChange={e => setNewProject(p => ({ ...p, budget: Number(e.target.value) }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="e.g. 50000000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Funding Goal (INR)</label>
                    <input type="number" required value={newProject.fundingGoal} onChange={e => setNewProject(p => ({ ...p, fundingGoal: Number(e.target.value) }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="e.g. 25000000" />
                  </div>
                </div>

                {/* Director Terms Verification */}
                <div className="flex items-start gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                  <input
                    type="checkbox"
                    required
                    id="accepted-director-terms"
                    checked={acceptedDirectorTerms}
                    onChange={(e) => setAcceptedDirectorTerms(e.target.checked)}
                    className="mt-1 accent-yellow-500 rounded border-zinc-800 bg-zinc-950 w-4 h-4 focus:ring-yellow-500"
                  />
                  <label htmlFor="accepted-director-terms" className="text-[10px] text-zinc-400 leading-relaxed cursor-pointer select-none">
                    I accept the BFI <strong className="text-yellow-500">Director Terms &amp; Conditions</strong> (including budget accuracy, copyright registration requirements, and production responsibilities). (Required)
                  </label>
                </div>

                <button type="submit" disabled={isSubmitting || !isScriptRegistered || !acceptedDirectorTerms} className="w-full py-6 bg-yellow-400 text-black font-black uppercase rounded-3xl shadow-xl transition-all mt-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-300 active:scale-95 flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Globe size={18} /> Broadcast Bidding Node</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
