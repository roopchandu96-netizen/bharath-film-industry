
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/firebase';
import { User, MovieProject } from '../types';
import { CURRENCY_FORMATTER } from '../constants';
import { notifyNewSynopsis } from '../services/notificationService';

interface DirectorDashboardProps {
    user: User;
    onOpenSubmission: () => void;
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ user, onOpenSubmission }) => {
    const [loading, setLoading] = useState(false);
    const [myProjects, setMyProjects] = useState<MovieProject[]>([]);
    const [activeView, setActiveView] = useState('dashboard');

    // Updates State
    const [updateText, setUpdateText] = useState('');
    const [updates, setUpdates] = useState<{ date: string, text: string, type: 'note' | 'photo' }[]>([]);

    // Synopsis State
    const [synopsisDoc, setSynopsisDoc] = useState<{ name: string, url: string, date: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Data Fetch & Subscription
    useEffect(() => {
        if (!user?.id) return;

        fetchMyProjects();

        const channel = supabase
            .channel('director_projects')
            .on('postgres_changes', { 
                event: '*', 
                table: 'projects', 
                schema: 'public',
                filter: `directorId=eq.${user.id}`
            }, () => {
                fetchMyProjects();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchMyProjects = async () => {
        setLoading(true);

        try {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('directorId', user.id)
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setMyProjects(data as MovieProject[]);
            } else {
                setMyProjects([]);
            }
        } catch (error) {
            console.error("DirectorDashboard: Error fetching director projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostUpdate = (type: 'note' | 'photo') => {
        if (!updateText.trim() && type === 'note') return;
        setUpdates([{ date: new Date().toLocaleDateString(), text: type === 'photo' ? 'Production Photo Posted' : updateText, type }, ...updates]);
        setUpdateText('');
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockUrl = URL.createObjectURL(file);
        setSynopsisDoc({
            name: file.name,
            url: mockUrl,
            date: new Date().toLocaleDateString()
        });

        // Notification Logic
        const projectTitle = myProjects[0]?.title || 'Untitled Project';
        await notifyNewSynopsis(user.name, projectTitle);
        alert("Synopsis uploaded successfully. BFI Admin has been notified via email.");

        setIsUploading(false);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const activeProject = myProjects[0];
    const totalFunding = activeProject?.currentFunding || 0;
    const fundingGoal = activeProject?.fundingGoal || 0;
    const percentFunded = fundingGoal > 0 ? Math.round((totalFunding / fundingGoal) * 100) : 0;
    const remainingFunding = fundingGoal - totalFunding;

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: '📊' },
        { id: 'my_project', label: 'Details', icon: '🎬' },
        { id: 'synopsis', label: 'Script', icon: '📝' },
        { id: 'funding', label: 'Funding', icon: '💰' },
        { id: 'updates', label: 'Updates', icon: '📢' },
        { id: 'notifications', label: 'Inbox', icon: '🔔' },
    ];

    if (loading) return <div className="flex justify-center items-center h-96 text-amber-500">Loading Studio...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* SUB-NAVIGATION TABS */}
            <div className="sticky top-20 z-30 bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-800 pb-4 pt-2 -mx-6 px-6 md:mx-0 md:px-0 md:static md:bg-transparent md:border-b-0 md:pb-0 md:pt-0">
                <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${activeView === item.id
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* DASHBOARD CONTENT */}
            <div className="min-h-[60vh]">
                {/* 1. DASHBOARD */}
                {activeView === 'dashboard' && (
                    <div className="space-y-12">
                        {!activeProject ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-slate-900/50 border border-slate-800 rounded-[3rem] text-center space-y-6">
                                <span className="text-6xl">🎬</span>
                                <h3 className="text-2xl font-bold text-white">No Active Projects</h3>
                                <p className="text-slate-500 max-w-md">You haven't listed a project yet. Submit your synopsis to get started with BFI funding.</p>
                                <button
                                    onClick={onOpenSubmission}
                                    className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/20"
                                >
                                    List Your First Project
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-amber-500/30 transition-colors rounded-3xl shadow-xl group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">🎬</div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded-md">Active</span>
                                        </div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Project Title</p>
                                        <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">{activeProject?.title}</h3>
                                    </div>

                                    <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-amber-500/30 transition-colors rounded-3xl shadow-xl group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">🎯</div>
                                        </div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Funding Goal</p>
                                        <h3 className="text-3xl font-mono text-white tracking-tighter">{CURRENCY_FORMATTER.format(fundingGoal)}</h3>
                                    </div>

                                    <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-amber-500/30 transition-colors rounded-3xl shadow-xl group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 group-hover:scale-110 transition-transform">💰</div>
                                            <div className="text-xs font-bold text-green-500 bg-green-950/30 px-2 py-1 rounded-md border border-green-500/20">+{percentFunded}%</div>
                                        </div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Raised</p>
                                        <h3 className="text-3xl font-mono text-green-400 tracking-tighter">{CURRENCY_FORMATTER.format(totalFunding)}</h3>
                                    </div>

                                    <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-amber-500/30 transition-colors rounded-3xl shadow-xl group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">🚀</div>
                                        </div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Current Status</p>
                                        <h3 className={`text-2xl font-black uppercase tracking-wide ${activeProject?.status === 'ACTIVE' ? 'text-white' : 'text-amber-500'}`}>{activeProject?.status || 'PENDING'}</h3>
                                    </div>
                                </div>

                                {/* Central Visual Component */}
                                <div className="p-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                                        <div className="w-full md:w-1/3">
                                            <h3 className="text-2xl font-bold text-white mb-2">Campaign Velocity</h3>
                                            <p className="text-slate-400 mb-8 leading-relaxed">Your project is gaining traction. At the current rate, funding goal is projected to be met by <span className="text-amber-500 font-bold">March 15th</span>.</p>

                                            <div className="space-y-4">
                                                <div className="flex justify-between text-sm font-bold text-slate-300">
                                                    <span>Progress</span>
                                                    <span>{percentFunded}%</span>
                                                </div>
                                                <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 ring-1 ring-slate-800/50">
                                                    <div className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-1000 relative" style={{ width: `${percentFunded}%` }}>
                                                        <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/50 animate-pulse"></div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-500 font-mono pt-1">
                                                    <span>Raised: {CURRENCY_FORMATTER.format(totalFunding)}</span>
                                                    <span>Goal: {CURRENCY_FORMATTER.format(fundingGoal)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
                                            <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-colors">
                                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                                <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                                    <span className="ml-1 text-white text-xl">▶</span>
                                                </div>
                                                <span className="absolute bottom-4 left-4 text-xs font-bold text-white uppercase tracking-wider">Play Teaser</span>
                                            </div>
                                            <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center gap-2 hover:border-slate-600 transition-colors cursor-pointer">
                                                <span className="text-3xl">📄</span>
                                                <h4 className="text-white font-bold">Read Script</h4>
                                                <p className="text-xs text-slate-500">Latest Draft • v4.2</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* 2. MY PROJECT FORM */}
                {activeView === 'my_project' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-5xl mx-auto shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-8 mb-8">
                            <h2 className="text-2xl font-bold text-white">Project Details</h2>
                            <button className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors shadow-lg shadow-amber-900/20">
                                Save Changes
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-amber-500 uppercase tracking-widest">Movie Title</label>
                                    <input defaultValue={activeProject?.title} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white text-lg focus:border-amber-500 focus:outline-none transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logline</label>
                                    <textarea defaultValue={activeProject?.tagline} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-slate-300 h-32 resize-none focus:border-amber-500 focus:outline-none transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Production Budget</label>
                                    <input defaultValue={activeProject?.budget} type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white font-mono focus:border-amber-500 focus:outline-none transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="aspect-[16/9] bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-500 hover:border-amber-500/50 hover:bg-slate-900/50 transition-all cursor-pointer group">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">🖼️</span>
                                    <span className="text-sm font-bold uppercase tracking-widest">Upload Poster Art</span>
                                </div>
                                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Teaser Video Link</label>
                                    <input placeholder="https://youtube.com/..." className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-blue-400 focus:border-amber-500 focus:outline-none transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. SYNOPSIS (Website Style) */}
                {activeView === 'synopsis' && (
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-white">Script Vault</h2>
                            <p className="text-slate-400 max-w-lg mx-auto">Securely upload and manage your screenplay versions. Access is restricted to BFI admins and potential Tier-1 investors.</p>
                        </div>

                        <input type="file" ref={fileInputRef} className="hidden" />
                        <div onClick={triggerFileInput} className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-[3rem] p-24 cursor-pointer transition-all hover:shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-5xl shadow-xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                                    📄
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-500 transition-colors">Upload Screenplay</h3>
                                    <p className="text-slate-500 mt-2 font-mono text-sm">PDF, FDX, or DOCX (Max 25MB)</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <button className="py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold hover:text-white hover:border-slate-600 transition-all shadow-lg">👁 Preview</button>
                            <button className="py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold hover:text-white hover:border-slate-600 transition-all shadow-lg">⬇ Download</button>
                            <button className="py-4 bg-slate-900 border border-slate-800 rounded-2xl text-amber-500 font-bold hover:bg-amber-500/10 hover:border-amber-500/50 transition-all shadow-lg">↺ Replace Version</button>
                        </div>
                    </div>
                )}

                {/* 4. FUNDING TRACKER (Visual) */}
                {activeView === 'funding' && (
                    <div className="space-y-12">
                        <div className="p-12 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl">
                            <div className="flex justify-between items-end mb-12">
                                <div>
                                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Total Funding Goal</p>
                                    <h2 className="text-6xl font-black text-white tracking-tighter">{CURRENCY_FORMATTER.format(fundingGoal)}</h2>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block px-6 py-2 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 font-bold mb-2">
                                        {percentFunded}% Funded
                                    </div>
                                    <p className="text-slate-400 text-sm">Campaign closes in 45 days</p>
                                </div>
                            </div>

                            {/* Big Bar */}
                            <div className="h-8 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner mb-12 relative">
                                <div className="h-full bg-gradient-to-r from-green-600 via-green-500 to-green-400 shadow-[0_0_40px_rgba(34,197,94,0.4)] relative" style={{ width: `${percentFunded}%` }}>
                                    <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white"></div>
                                    <div className="absolute right-0 -top-8 bg-white text-black text-xs font-bold px-2 py-1 rounded shadow-lg transform translate-x-1/2">
                                        Current
                                    </div>
                                </div>
                                {/* Milestone Markers */}
                                <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-700 border-r border-slate-700/50 border-dashed"></div>
                                <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-slate-700 border-r border-slate-700/50 border-dashed"></div>
                                <div className="absolute top-0 bottom-0 left-[75%] w-[1px] bg-slate-700 border-r border-slate-700/50 border-dashed"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800">
                                    <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Raised</h4>
                                    <p className="text-3xl font-mono text-green-400">{CURRENCY_FORMATTER.format(totalFunding)}</p>
                                </div>
                                <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800">
                                    <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Remaining</h4>
                                    <p className="text-3xl font-mono text-amber-500">{CURRENCY_FORMATTER.format(remainingFunding)}</p>
                                </div>
                                <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 text-2xl">🔒</div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Investor Privacy</h4>
                                        <p className="text-xs text-slate-500">Identities Hidden</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. UPDATES, 6. NOTIFICATIONS, 7. PROFILE (Standard Website Cards) */}
                {['updates', 'notifications', 'profile'].includes(activeView) && (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="p-12 bg-slate-900 border border-slate-800 rounded-[3rem] text-center">
                            <div className="bg-slate-950 w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl border border-slate-800">
                                {activeView === 'updates' ? '📢' : activeView === 'notifications' ? '🔔' : '👤'}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {activeView === 'updates' ? 'Project Updates' : activeView === 'notifications' ? 'Inbox' : 'Director Profile'}
                            </h2>
                            <p className="text-slate-500 mb-8">
                                {activeView === 'updates' ? 'Keep your investors in the loop.' : activeView === 'notifications' ? 'Stay updated on project milestones.' : 'Manage your public director persona.'}
                            </p>

                            {/* Placeholder Content Blocks matching the style */}
                            <div className="bg-slate-950/50 rounded-2xl border border-slate-800/50 p-8 text-left space-y-4">
                                {activeView === 'updates' && (
                                    <>
                                        <textarea className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white resize-none h-32" placeholder="Write an update..." />
                                        <button className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400">Post Update</button>
                                    </>
                                )}
                                {activeView === 'notifications' && (
                                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-slate-500">
                                            🔔
                                        </div>
                                        <p className="text-slate-500 text-sm">No new system alerts.</p>
                                    </div>
                                )}
                                {activeView === 'profile' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-6">
                                            <img src={user.photoURL} className="w-16 h-16 rounded-full border-2 border-slate-700" />
                                            <div>
                                                <h3 className="text-white font-bold">{user.name}</h3>
                                                <p className="text-green-500 text-xs font-bold uppercase">✓ Verified Director</p>
                                            </div>
                                            <button className="ml-auto text-amber-500 text-xs font-bold uppercase hover:underline">Edit</button>
                                        </div>

                                        <div className="pt-6 border-t border-slate-800 space-y-4">
                                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Support & Inquiries</h4>
                                            <p className="text-slate-500 text-sm">Need assistance with your project listing? Contact the BFI Admin team directly.</p>
                                            <a href="mailto:bharathfilmindustry@gmail.com" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700">
                                                📧 Contact via Email
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectorDashboard;
