
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
import PaymentGateway from './components/PaymentGateway.tsx';
import BFIIntellect from './components/BFIIntellect.tsx';
import AdminDashboard from './views/AdminDashboard.tsx';
import DirectorDashboard from './views/DirectorDashboard.tsx';
import { UserRole, MovieProject, User } from './types.ts';
import { Loader2, X, Globe, Film, AlignLeft, Tag, UploadCloud } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [showAuth, setShowAuth] = useState(false);
  const [selectedProject, setSelectedProject] = useState<MovieProject | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investmentRequest, setInvestmentRequest] = useState<{ project: MovieProject; amount: number } | null>(null);

  const [newProject, setNewProject] = useState({
    title: '',
    tagline: '',
    genre: 'Action/Thriller',
    budget: 50000000,
    fundingGoal: 25000000,
    description: '', // This acts as the Synopsis
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    teaserUrl: ''
  });

  useEffect(() => {
    // Safety Force Load: In case onAuthStateChange never fires or hangs
    const globalTimeout = setTimeout(() => {
      console.warn("App: Auth global timeout reached. Forcing load.");
      setAuthLoading(false);
    }, 12000);

    const legacySessionStr = localStorage.getItem('bfi_legacy_session');
    if (legacySessionStr) {
      const parsedSession = JSON.parse(legacySessionStr);
      setSession(parsedSession);
      const fallbackRole = parsedSession.user.user_metadata?.role || UserRole.INVESTOR;
      setUser({
        id: parsedSession.user.id,
        email: parsedSession.user.email,
        name: parsedSession.user.user_metadata?.full_name || 'Legacy User',
        role: fallbackRole,
        kycStatus: 'VERIFIED',
        totalInvested: 0,
        projects: []
      });
      if (fallbackRole === UserRole.ADMIN) setActiveTab('admin');
      else if (fallbackRole === UserRole.DIRECTOR) setActiveTab('portfolio');
      else setActiveTab('explore');
      
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
          } else if (userData.role === UserRole.DIRECTOR) {
            console.log("User is DIRECTOR. Setting tab to 'portfolio'");
            setActiveTab('portfolio');
          } else {
            console.log("User is INVESTOR (or other). Setting tab to 'explore'");
            setActiveTab('explore');
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
          if (fallbackRole === UserRole.DIRECTOR) {
            setActiveTab('portfolio');
          } else if (fallbackRole === UserRole.ADMIN) {
            setActiveTab('admin');
          } else {
            setActiveTab('explore');
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
    setIsSubmitting(true);
    try {
      await createProject({
        ...newProject,
        director: user.name,
        status: 'PENDING',
        investorCount: 0,
        currentFunding: 0,
      });
      notifyNewSynopsis(user.name, newProject.title);
      setIsProjectModalOpen(false);

      // Keep on portfolio view but refresh might happen via sync
      alert("Synopsis submitted successfully. BFI Admin has been notified via email.");
    } catch (e: any) {
      console.error(e);
      alert(`Submission failed: ${e.message || "Check network link."}`);
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-yellow-400" /></div>;
  
  if (!session || !user) {
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
      <div className="min-h-screen bg-[#0f172a] overflow-auto flex flex-col font-sans selection:bg-yellow-500/30 text-slate-200">
        <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white leading-none tracking-tight">Bharath <span className="text-yellow-500">Film Industry</span></h1>
            </div>
            <button 
              onClick={() => setShowAuth(true)} 
              className="px-6 py-2.5 bg-yellow-500 text-black font-bold text-sm rounded-full hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            >
              Sign In / Register
            </button>
          </div>
        </header>
        
        <AboutView />
        
        <footer className="bg-[#020617] border-t border-slate-900 py-12 text-center text-slate-500 text-sm">
           © 2026 Bharath Film Industry. All rights reserved. Built on Secured Nodes.
        </footer>
      </div>
    );
  }


  // Logic: Only show AdminDashboard if explicitly select 'admin' tab (and user is admin)
  // This allows Directors (or Admins acting as Directors) to see the normal Layout.
  if (activeTab === 'admin' && user.role === UserRole.ADMIN) {
    return <AdminDashboard user={user} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={user.role}>
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onInvest={user.role === UserRole.INVESTOR ? (amount) => setInvestmentRequest({ project: selectedProject, amount }) : undefined}
          onPlayTrailer={() => { }}
        />
      ) : (
        <>
          {activeTab === 'explore' && <ExploreView onSelectProject={setSelectedProject} onQuickInvest={(p) => setInvestmentRequest({ project: p, amount: 100000 })} user={user} onOpenSubmission={() => setIsProjectModalOpen(true)} />}

          {/* DIRECTOR DASHBOARD LOGIC */}
          {activeTab === 'portfolio' && (
            user.role === UserRole.DIRECTOR ?
              <DirectorDashboard user={user} onOpenSubmission={() => setIsProjectModalOpen(true)} /> :
              <InvestorDashboard user={user} />
          )}

          {activeTab === 'profile' && <ProfileView user={user} onUpdate={(updated) => setUser(updated)} />}
          {activeTab === 'about' && <AboutView />}
        </>
      )}

      <BFIIntellect />

      {investmentRequest && (
        <PaymentGateway
          project={investmentRequest.project}
          amount={investmentRequest.amount}
          onSuccess={() => { setInvestmentRequest(null); setSelectedProject(null); }}
          onCancel={() => setInvestmentRequest(null)}
        />
      )}

      {/* Director Project Submission Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-zinc-950 border border-yellow-400/20 rounded-[3rem] overflow-hidden shadow-3xl">
            <div className="p-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-2xl font-serif text-white">List Production Node</h2>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Broadcast cinematic synopsis to producer circuit</p>
                </div>
                <button onClick={() => setIsProjectModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors"><X /></button>
              </div>

              <form onSubmit={handleProjectSubmission} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><Film size={10} /> Film Title</label>
                    <input required value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="e.g. The Infinite" />
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
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1">Punchy Tagline</label>
                  <input required value={newProject.tagline} onChange={e => setNewProject(p => ({ ...p, tagline: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" placeholder="Every story has a beginning, this one has no end." />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><AlignLeft size={10} /> Official Synopsis</label>
                  <textarea required rows={5} value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none resize-none leading-relaxed" placeholder="Detailed cinematic summary for institutional review..." />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><UploadCloud size={10} /> Synopsis Document (PDF / DOC)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { console.log("File selected:", file.name); }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl py-4 px-6 text-sm text-zinc-400 group-hover:border-yellow-400/50 group-hover:text-yellow-400 transition-all flex items-center justify-center gap-2">
                      <UploadCloud size={16} />
                      <span>Click to Upload Synopsis File</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Poster URL</label>
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

                <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-yellow-400 text-black font-black uppercase rounded-3xl shadow-xl transition-all mt-4 disabled:opacity-50 hover:bg-yellow-300 active:scale-95 flex items-center justify-center gap-3">
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
