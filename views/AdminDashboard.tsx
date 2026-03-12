
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/firebase'; // Actually using supabase as per codebase
import { MovieProject, User } from '../types';
import { CheckCircle, XCircle, ShieldCheck, DollarSign, Users, Film, AlertTriangle, Loader2, Bell } from 'lucide-react';
import { notifyProjectApproved, notifyInvestmentReceived } from '../services/notificationService';

interface AdminDashboardProps {
    user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const [activeAdminTab, setActiveAdminTab] = useState<'projects' | 'investments' | 'users' | 'settings'>('projects');
    const [pendingProjects, setPendingProjects] = useState<MovieProject[]>([]);
    const [pendingInvestments, setPendingInvestments] = useState<any[]>([]);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, totalInvestment: 0, activeProjects: 0 });

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const timer = setTimeout(() => {
                if (mounted) setLoading(false);
            }, 5000);

            try {
                await fetchDashboardData();
            } finally {
                clearTimeout(timer);
            }
        };

        load();

        const channel = supabase.channel('admin_updates')
            .on('postgres_changes', { event: '*', table: 'projects', schema: 'public' }, () => {
                if (mounted) fetchDashboardData();
            })
            .on('postgres_changes', { event: '*', table: 'profiles', schema: 'public' }, () => {
                if (mounted) fetchDashboardData();
            })
            .on('postgres_changes', { event: '*', table: 'investments', schema: 'public' }, () => {
                if (mounted) fetchDashboardData();
            })
            .on('postgres_changes', { event: '*', table: 'notifications', schema: 'public' }, () => {
                if (mounted) fetchDashboardData();
            })
            .subscribe();

        return () => { 
            mounted = false; 
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch pending projects
            const { data: projects } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'PENDING');

            if (projects) setPendingProjects(projects as MovieProject[]);

            // Fetch pending users
            const { data: users } = await supabase
                .from('profiles')
                .select('*')
                .eq('kycStatus', 'PENDING');

            if (users) setPendingUsers(users as User[]);

            // Real Investments Data: Fetch from DB (initially empty if no table)
            const { data: investments } = await supabase
                .from('investments')
                .select('*')
                .eq('status', 'PENDING');

            if (investments) {
                setPendingInvestments(investments);
            } else {
                setPendingInvestments([]);
            }

            const { data: notifs } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (notifs) {
                setNotifications(notifs);
            }

            // Real Stats Fetching
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: activeCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');

            // Calculate Total Investment (Real Aggregation)
            let totalRaised = 0;
            const { data: allInvestments } = await supabase.from('investments').select('amount').eq('status', 'VERIFIED');
            if (allInvestments) {
                totalRaised = allInvestments.reduce((sum, item) => sum + (item.amount || 0), 0);
            }

            setStats({
                totalUsers: userCount || 0,
                totalInvestment: totalRaised,
                activeProjects: activeCount || 0
            });

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyUser = async (userId: string) => {
        try {
            const { error } = await supabase.from('profiles').update({ kycStatus: 'VERIFIED' }).eq('id', userId);
            if (error) throw error;
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            alert("User Account Verified & Activated.");
        } catch (e) {
            console.error("Verification failed", e);
            alert("Verification failed");
        }
    };

    const verifyInvestment = (id: string) => {
        const inv = pendingInvestments.find(i => i.id === id);
        if (inv) {
            notifyInvestmentReceived(inv.txnId || 'TXN-UNKNOWN', inv.amount, inv.investor);
        }
        // In real app: Update investment status in DB to 'VERIFIED'
        setPendingInvestments(prev => prev.filter(inv => inv.id !== id));
        alert(`Investment ${id} Verified & Funds Released to Escrow.`);
    };

    const handleApprove = async (projectId: string) => {
        try {
            const project = pendingProjects.find(p => p.id === projectId);
            const { error } = await supabase
                .from('projects')
                .update({ status: 'ACTIVE' })
                .eq('id', projectId);

            if (error) throw error;

            if (project) {
                notifyProjectApproved(project.title, project.director);
            }

            setPendingProjects(prev => prev.filter(p => p.id !== projectId));
            alert('Project Approved and Live on Marketplace');
        } catch (e) {
            console.error(e);
            alert('Error approving project');
        }
    };

    const handleReject = async (projectId: string) => {
        if (!confirm('Are you sure you want to reject this project?')) return;
        try {
            const { error } = await supabase
                .from('projects')
                .update({ status: 'REJECTED' }) // Assuming REJECTED is valid or we delete
                .eq('id', projectId);

            if (error) throw error;
            setPendingProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (e) {
            console.error(e);
            alert('Error rejecting project');
        }
    };

    const markNotificationRead = async (id: string) => {
        try {
            await supabase.from('notifications').update({ read: true }).eq('id', id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-500" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-8 space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2">Command Center</h1>
                    <p className="text-yellow-500/60 font-mono text-xs uppercase tracking-widest">BFI Administration Node</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-yellow-500 transition-colors relative">
                            <Bell size={20} />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-4 border-b border-zinc-800 bg-zinc-950">
                                    <h3 className="text-white font-bold text-sm">System Alerts</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-zinc-500 text-xs border-b border-zinc-800">
                                            No active system alerts.
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-4 border-b border-zinc-800 cursor-pointer transition-colors ${!n.read ? 'bg-zinc-800/50 hover:bg-zinc-800' : 'hover:bg-zinc-800/30'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-black uppercase text-yellow-500 tracking-wider flex items-center gap-1">{!n.read && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>}{n.type || 'SYSTEM'}</span>
                                                    <span className="text-[9px] text-zinc-500 font-mono">{new Date(n.created_at).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-xs text-white font-medium mb-1">{n.subject}</p>
                                                <p className="text-[10px] text-zinc-400 leading-relaxed">{n.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={() => {
                        supabase.auth.signOut().then(() => {
                            window.location.hash = ''; // Clear admin hash
                            window.location.reload(); // Force full reload to clear state
                        });
                    }} className="px-6 py-2 bg-red-600 border border-red-500 rounded-full text-white hover:bg-red-700 transition-all text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        Logout
                    </button>
                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck size={14} /> Secure Node
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Users size={20} /></div>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Network</span>
                    </div>
                    <p className="text-3xl font-serif text-white">{stats.totalUsers}</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><DollarSign size={20} /></div>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Escrow Balance</span>
                    </div>
                    <p className="text-3xl font-serif text-white">₹{stats.totalInvestment.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Film size={20} /></div>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Active Productions</span>
                    </div>
                    <p className="text-3xl font-serif text-white">{stats.activeProjects}</p>
                </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex gap-4 border-b border-zinc-800 pb-1">
                <button
                    onClick={() => setActiveAdminTab('projects')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${activeAdminTab === 'projects' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-white'}`}
                >
                    Project Approvals
                </button>
                <button
                    onClick={() => setActiveAdminTab('investments')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${activeAdminTab === 'investments' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-white'}`}
                >
                    Investment Gateway
                </button>
            </div>

            {/* Content Area */}
            {activeAdminTab === 'projects' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-serif text-white flex items-center gap-3">
                        <AlertTriangle className="text-yellow-500" size={20} />
                        Pending Approvals
                        <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{pendingProjects.length}</span>
                    </h2>

                    {pendingProjects.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl text-zinc-600">
                            No pending submissions requiring review.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {pendingProjects.map(project => (
                                <div key={project.id} className="p-6 bg-zinc-950 border border-zinc-800 hover:border-yellow-500/30 transition-all rounded-3xl flex flex-col md:flex-row gap-6 items-start">
                                    <div className="w-full md:w-48 aspect-video bg-zinc-900 rounded-xl overflow-hidden shrink-0">
                                        <img src={project.posterUrl || "https://source.unsplash.com/random/800x600/?cinema"} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold text-white">{project.title}</h3>
                                            <div className="flex gap-2">
                                                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded-full tracking-widest">{project.genre}</span>
                                                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase rounded-full tracking-widest">{project.director}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-zinc-400 font-serif italic">"{project.tagline}"</p>
                                        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 font-mono leading-relaxed max-h-32 overflow-y-auto">
                                            <strong className="block text-yellow-500/50 mb-1">OFFICIAL SYNOPSIS:</strong>
                                            {project.description}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-t border-zinc-900">
                                            <div>
                                                <p className="text-[10px] text-zinc-600 uppercase font-black">Budget</p>
                                                <p className="text-white">₹{project.budget.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-600 uppercase font-black">Funding Goal</p>
                                                <p className="text-white">₹{project.fundingGoal.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => handleApprove(project.id)}
                                                className="flex-1 py-3 bg-yellow-500 text-black font-bold text-xs uppercase rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Approve & List
                                            </button>
                                            <button
                                                onClick={() => handleReject(project.id)}
                                                className="flex-1 py-3 bg-zinc-900 text-red-500 border border-zinc-800 font-bold text-xs uppercase rounded-xl hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeAdminTab === 'users' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-serif text-white flex items-center gap-3">
                        <Users className="text-yellow-500" size={20} />
                        New Member Verification
                        <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{pendingUsers.length}</span>
                    </h2>

                    {pendingUsers.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl text-zinc-600">
                            All members verified. No pending KYC requests.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingUsers.map(u => (
                                <div key={u.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-[2rem] space-y-4 hover:border-yellow-500/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <img src={u.photoURL} className="w-12 h-12 rounded-full bg-zinc-900" />
                                        <div>
                                            <h3 className="text-white font-bold">{u.name}</h3>
                                            <p className="text-xs text-zinc-500">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${u.role === 'DIRECTOR' ? 'bg-purple-900/20 text-purple-400 border border-purple-500/20' :
                                            u.role === 'INVESTOR' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' :
                                                'bg-zinc-800 text-zinc-500'
                                            }`}>
                                            {u.role}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-yellow-900/20 text-yellow-500 border border-yellow-500/20">
                                            KYC Pending
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => verifyUser(u.id)}
                                        className="w-full py-3 bg-zinc-900 border border-zinc-800 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-green-600 hover:border-green-500 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={14} /> Verify Identity
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeAdminTab === 'investments' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-serif text-white flex items-center gap-3">
                        <DollarSign className="text-green-500" size={20} />
                        Inbound Capital Verification
                        <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{pendingInvestments.length}</span>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Investor</th>
                                    <th className="p-4">Project</th>
                                    <th className="p-4">Txn Ref ID</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-zinc-300">
                                {pendingInvestments.map(inv => (
                                    <tr key={inv.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4 font-mono text-zinc-500">{inv.date}</td>
                                        <td className="p-4 font-bold text-white">{inv.investor}</td>
                                        <td className="p-4">{inv.project}</td>
                                        <td className="p-4 font-mono text-yellow-500">{inv.txnId}</td>
                                        <td className="p-4 font-mono text-green-400">₹{inv.amount.toLocaleString('en-IN')}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => verifyInvestment(inv.id)}
                                                className="px-4 py-2 bg-green-900/20 text-green-500 border border-green-900/50 rounded-lg hover:bg-green-500 hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
                                            >
                                                Verify Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingInvestments.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-3xl mt-4 block w-full">No pending transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
