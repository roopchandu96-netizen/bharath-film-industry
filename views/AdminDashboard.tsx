
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/firebase'; // Actually using supabase as per codebase
import { MovieProject, User } from '../types';
import { CheckCircle, XCircle, ShieldCheck, DollarSign, Users, Film, AlertTriangle, Loader2, Bell } from 'lucide-react';
import { notifyProjectApproved, notifyInvestmentReceived } from '../services/notificationService';

interface AdminDashboardProps {
    user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const [activeAdminTab, setActiveAdminTab] = useState<'projects' | 'investments' | 'users' | 'settings' | 'tickets'>('projects');
    const [pendingProjects, setPendingProjects] = useState<MovieProject[]>([]);
    const [pendingInvestments, setPendingInvestments] = useState<any[]>([]);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ 
        pendingUsers: 0, 
        pendingProjects: 0, 
        pendingBookings: 0, 
        totalUsers: 0, 
        approvedProjects: 0, 
        totalBookings: 0, 
        totalRevenue: 0 
    });
    const [investmentSearch, setInvestmentSearch] = useState('');
    const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

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
            .on('postgres_changes', { event: '*', table: 'movie_bookings', schema: 'public' }, () => {
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
            let pendingProjectsCount = 0;
            let pendingUsersCount = 0;
            let pendingBookingsCount = 0;

            // Temp debug logging
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                console.log("DEBUG [AdminDashboard]: Authenticated User ID:", authUser?.id);
                console.log("DEBUG [AdminDashboard]: Authenticated User Email:", authUser?.email);
                console.log("DEBUG [AdminDashboard]: AdminDashboard Prop User:", user);
            } catch (err) {
                console.error("DEBUG [AdminDashboard] failed to get auth user:", err);
            }
            
            // 1. Fetch pending projects
            try {
                const { data: projects, error } = await supabase
                    .from('projects')
                    .select('*');
                if (error) {
                    console.error("SUPABASE ERROR [projects query]:", error);
                }
                if (projects) {
                    const sortedProjects = [...projects].sort((a, b) => {
                        const aPending = (a.status || '').toUpperCase() === 'PENDING';
                        const bPending = (b.status || '').toUpperCase() === 'PENDING';
                        if (aPending && !bPending) return -1;
                        if (!aPending && bPending) return 1;
                        return 0;
                    });
                    setPendingProjects(sortedProjects as MovieProject[]);
                    pendingProjectsCount = projects.filter(p => (p.status || '').toUpperCase() === 'PENDING').length;
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
            }

            // 2. Fetch pending users
            try {
                const { data: users, error } = await supabase
                    .from('profiles')
                    .select('*');
                if (error) {
                    console.error("SUPABASE ERROR [profiles query]:", error);
                }
                if (users) {
                    const sortedUsers = [...users].sort((a, b) => {
                        const aPending = (a.kycStatus || '').toUpperCase() === 'PENDING';
                        const bPending = (b.kycStatus || '').toUpperCase() === 'PENDING';
                        if (aPending && !bPending) return -1;
                        if (!aPending && bPending) return 1;
                        return 0;
                    });
                    setPendingUsers(sortedUsers as User[]);
                    pendingUsersCount = users.filter(u => (u.kycStatus || '').toUpperCase() === 'PENDING').length;
                }
            } catch (err) {
                console.error("Error fetching pending users:", err);
            }

            // 3. Fetch pending investments
            try {
                const { data: investments, error } = await supabase
                    .from('investments')
                    .select('*');
                if (error) {
                    console.error("SUPABASE ERROR [investments query]:", error);
                }
                if (investments) {
                    const sortedInvestments = [...investments].sort((a, b) => {
                        const aPending = (a.status || '').toUpperCase() === 'PENDING';
                        const bPending = (b.status || '').toUpperCase() === 'PENDING';
                        if (aPending && !bPending) return -1;
                        if (!aPending && bPending) return 1;
                        return 0;
                    });
                    setPendingInvestments(sortedInvestments);
                } else {
                    setPendingInvestments([]);
                }
            } catch (err) {
                console.error("Error fetching pending investments:", err);
            }

            // 4. Fetch notifications
            try {
                const { data: notifs, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (error) {
                    console.error("SUPABASE ERROR [notifications query]:", error);
                }
                if (notifs) setNotifications(notifs);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }

            // 5. Fetch pending movie bookings (awaiting admin UTR verification)
            try {
                const { data: bookings, error } = await supabase
                    .from('movie_bookings')
                    .select(`
                        id,
                        booking_id,
                        amount,
                        status,
                        payment_status,
                        created_at,
                        quantity,
                        phone,
                        email,
                        name,
                        payments (
                            gateway_order_id,
                            payment_status
                        )
                    `);
                if (error) {
                    console.error("SUPABASE ERROR [bookings query]:", error);
                }

                if (bookings) {
                    // Filter bookings to display only those awaiting admin approval with submitted UTRs
                    const filteredBookings = bookings.filter((b: any) => {
                        const utrVal = b.payments?.[0]?.gateway_order_id;
                        const paymentStatus = b.payment_status;
                        const bookingStatus = b.status;
                        
                        return utrVal && utrVal.trim() !== '' && 
                               (paymentStatus || '').toLowerCase() === 'pending verification' &&
                               (bookingStatus || '').toLowerCase() === 'pending admin approval';
                    });

                    const formatted = filteredBookings.map((b: any) => ({
                        id: b.id,
                        bookingId: b.booking_id,
                        amount: b.amount,
                        status: b.status,
                        paymentStatus: b.payment_status,
                        createdAt: b.created_at,
                        quantity: b.quantity,
                        phone: b.phone,
                        email: b.email,
                        name: b.name,
                        utr: b.payments?.[0]?.gateway_order_id || 'N/A'
                    }));

                    setPendingBookings(formatted);
                    pendingBookingsCount = filteredBookings.length;
                } else {
                    setPendingBookings([]);
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);
            }

            // 6. Fetch stats
            try {
                const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: activeProjectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
                const { count: bookingsCount } = await supabase.from('movie_bookings').select('*', { count: 'exact', head: true });
                
                const { data: confirmedBookings } = await supabase
                    .from('movie_bookings')
                    .select('amount')
                    .eq('status', 'CONFIRMED');
                let totalRevenue = 0;
                if (confirmedBookings) {
                    totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
                }

                setStats({
                    pendingUsers: pendingUsersCount,
                    pendingProjects: pendingProjectsCount,
                    pendingBookings: pendingBookingsCount,
                    totalUsers: userCount || 0,
                    approvedProjects: activeProjectsCount || 0,
                    totalBookings: bookingsCount || 0,
                    totalRevenue: totalRevenue
                });
            } catch (err) {
                console.error("Error fetching stats:", err);
            }

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyUser = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            const { error } = await supabase.from('profiles').update({ kycStatus: status }).eq('id', userId);
            if (error) throw error;
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            alert(status === 'VERIFIED' ? "User Account Verified & Activated." : "User Account Rejected.");
        } catch (e: any) {
            console.error("Action failed", e);
            alert("Action failed: " + (e?.message || "Check network/RLS configuration."));
        }
    };

    const verifyInvestment = async (id: string, approve: boolean) => {
        const statusVal = approve ? 'VERIFIED' : 'REJECTED';
        const inv = pendingInvestments.find(i => i.id === id);
        try {
            const { error } = await supabase
                .from('investments')
                .update({ status: statusVal })
                .eq('id', id);

            if (error) throw error;

            if (approve && inv) {
                notifyInvestmentReceived(inv.txnId || 'TXN-UNKNOWN', inv.amount, inv.investor);
            }

            setPendingInvestments(prev => prev.filter(inv => inv.id !== id));
            alert(approve ? `Investment ${id} Verified & Funds Released to Escrow.` : `Investment ${id} Rejected.`);
        } catch (e: any) {
            console.error("Investment verification failed:", e);
            alert("Verification failed: " + (e?.message || "Check network configuration."));
        }
    };

    const approveTicketPayment = async (bookingId: string, bookingRef: string, quantity: number) => {
        if (!confirm(`Are you sure you want to APPROVE payment reference for Booking ${bookingRef}?`)) return;
        try {
            const timestamp = new Date().toISOString();

            // 1. Update movie_bookings status to Confirmed
            const { error: mbError } = await supabase
                .from('movie_bookings')
                .update({
                    status: 'Confirmed',
                    payment_status: 'Verified',
                    confirmed_at: timestamp
                })
                .eq('id', bookingId);

            if (mbError) throw mbError;

            // 2. Update payments record to Verified
            const { error: payError } = await supabase
                .from('payments')
                .update({
                    payment_status: 'Verified',
                    verified_at: timestamp
                })
                .eq('booking_id', bookingId);

            if (payError) throw payError;

            // 3. Generate individual tickets for the booking (one row per ticket)
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const ticketRows = [];
            const ticketNumbersList: string[] = [];
            for (let i = 0; i < quantity; i++) {
                const uniqueTicketNum = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                ticketNumbersList.push(uniqueTicketNum);
                ticketRows.push({
                    booking_id: bookingId,
                    ticket_number: uniqueTicketNum,
                    invoice_number: invoiceNumber,
                    email_sent: true
                });
            }

            // 4. Insert ticket records
            const { error: tktError } = await supabase
                .from('tickets')
                .insert(ticketRows);

            if (tktError) throw tktError;

            alert(`Booking ${bookingRef} approved successfully! Generated ${quantity} ticket(s): ${ticketNumbersList.join(', ')}`);
            await fetchDashboardData();
        } catch (e: any) {
            console.error("Booking verification failed:", e);
            alert("Approval failed: " + (e?.message || "Check network/RLS configuration."));
        }
    };

    const rejectTicketPayment = async (bookingId: string, bookingRef: string) => {
        if (!confirm(`Are you sure you want to REJECT payment reference for Booking ${bookingRef}?`)) return;
        try {
            // Fetch booking email for notification
            const { data: bookingData } = await supabase
                .from('movie_bookings')
                .select('email, name')
                .eq('id', bookingId)
                .maybeSingle();

            // 1. Update movie_bookings status to Payment Rejected
            const { error: mbError } = await supabase
                .from('movie_bookings')
                .update({
                    status: 'Payment Rejected',
                    payment_status: 'Rejected'
                })
                .eq('id', bookingId);

            if (mbError) throw mbError;

            // 2. Update payments record to Rejected
            const { error: payError } = await supabase
                .from('payments')
                .update({
                    payment_status: 'Rejected'
                })
                .eq('booking_id', bookingId);

            if (payError) throw payError;

            // 3. Notify user of rejection
            if (bookingData?.email) {
                await supabase.from('notifications').insert([{
                    recipient: bookingData.email,
                    subject: 'Ticket Payment Verification Failed',
                    message: `Hi ${bookingData.name || 'Customer'},\n\nYour manual payment reference for Booking ${bookingRef} could not be verified by BFI Admin. Please check your transaction details and submit a new UTR ID if required.`,
                    read: false,
                    type: 'SYSTEM'
                }]);
            }

            alert(`Booking ${bookingRef} rejected successfully.`);
            await fetchDashboardData();
        } catch (e: any) {
            console.error("Booking rejection failed:", e);
            alert("Rejection failed: " + (e?.message || "Check network/RLS configuration."));
        }
    };

    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (projectId: string) => {
        if (processingId) return;
        setProcessingId(projectId);
        try {
            const project = pendingProjects.find(p => p.id === projectId);
            const { data, error } = await supabase
                .from('projects')
                .update({ status: 'ACTIVE' })
                .eq('id', projectId)
                .select(); // Ask Supabase to return the row if successful

            if (error) throw error;
            
            // Supabase silent RLS failure (0 rows returned)
            if (!data || data.length === 0) {
               throw new Error("violates row-level security");
            }

            if (project) {
                notifyProjectApproved(project.title, project.director);
            }

            setPendingProjects(prev => prev.filter(p => p.id !== projectId));
            alert('Project Approved and Live on Marketplace');
        } catch (e: any) {
            console.error(e);
            if (e?.message?.includes('violates row-level security') || e?.details?.includes('rls') || !e) {
               alert("SECURITY BLOCKED: You MUST run the 'fix_rls_policies.sql' file in your Supabase SQL Editor for approvals to work. The database is silently blocking you.");
            } else {
               alert('Error approving project: ' + (e?.message || 'Unknown error'));
            }
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (projectId: string) => {
        if (!confirm('Are you sure you want to reject this project?')) return;
        if (processingId) return;
        setProcessingId(projectId);
        try {
            const { data, error } = await supabase
                .from('projects')
                .update({ status: 'REJECTED' }) 
                .eq('id', projectId)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) throw new Error("violates row-level security");

            setPendingProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (e: any) {
            console.error(e);
            alert("SECURITY BLOCKED: You MUST run the 'fix_rls_policies.sql' file in your Supabase SQL Editor for rejections to work.");
        } finally {
            setProcessingId(null);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Users size={20} /></div>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Registered Users</span>
                    </div>
                    <p className="text-3xl font-serif text-white">{stats.totalUsers}</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><DollarSign size={20} /></div>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                    </div>
                    <p className="text-3xl font-serif text-white">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Film size={20} /></div>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Approved Scripts</span>
                    </div>
                    <p className="text-3xl font-serif text-white">{stats.approvedProjects}</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><CheckCircle size={20} /></div>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                    </div>
                    <p className="text-3xl font-serif text-white">{stats.totalBookings}</p>
                </div>
            </div>

            {/* Pending Verifications Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Pending User Approvals</p>
                        <p className="text-2xl font-serif text-yellow-500 mt-1">{stats.pendingUsers}</p>
                    </div>
                </div>
                <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Pending Script Approvals</p>
                        <p className="text-2xl font-serif text-yellow-500 mt-1">{stats.pendingProjects}</p>
                    </div>
                </div>
                <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Pending Ticket Payments</p>
                        <p className="text-2xl font-serif text-yellow-500 mt-1">{stats.pendingBookings}</p>
                    </div>
                </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex gap-4 border-b border-zinc-800 pb-1 overflow-x-auto flex-nowrap scrollbar-hide">
                <button
                    onClick={() => setActiveAdminTab('projects')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'projects' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-white'}`}
                >
                    Script Approvals ({stats.pendingProjects})
                </button>
                <button
                    onClick={() => setActiveAdminTab('investments')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'investments' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-white'}`}
                >
                    Investment Gateway ({pendingInvestments.length})
                </button>
                <button
                    onClick={() => setActiveAdminTab('users')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'users' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-white'}`}
                >
                    User Approvals ({stats.pendingUsers})
                </button>
                <button
                    onClick={() => setActiveAdminTab('tickets')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'tickets' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-white'}`}
                >
                    Ticket Payment Verification ({stats.pendingBookings})
                </button>
            </div>

            {/* Content Area */}
            {activeAdminTab === 'projects' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-serif text-white flex items-center gap-3">
                        <Film className="text-yellow-500" size={20} />
                        Script Approval Dashboard
                        <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{pendingProjects.length}</span>
                    </h2>

                    <div className="overflow-x-auto bg-zinc-950 border border-zinc-900 rounded-[2rem] p-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                                    <th className="p-4">Script Title</th>
                                    <th className="p-4">Director / Owner</th>
                                    <th className="p-4">Genre</th>
                                    <th className="p-4">Language</th>
                                    <th className="p-4">Budget</th>
                                    <th className="p-4">Submission Date</th>
                                    <th className="p-4">Current Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-zinc-300">
                                {pendingProjects.map(project => (
                                    <tr key={project.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{project.title}</div>
                                            <div className="text-[10px] text-zinc-500 italic mt-0.5">"{project.tagline}"</div>
                                        </td>
                                        <td className="p-4 font-bold text-white">{project.director}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-[9px] font-bold uppercase rounded-full tracking-wider border border-yellow-500/10">{project.genre}</span>
                                        </td>
                                        <td className="p-4">English</td>
                                        <td className="p-4 font-mono text-zinc-400">₹{project.budget.toLocaleString('en-IN')}</td>
                                        <td className="p-4 font-mono text-zinc-500">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-yellow-900/20 text-yellow-500 border border-yellow-500/20">
                                                {project.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => alert(`Script Details:\n\nTitle: ${project.title}\nDirector: ${project.director}\nGenre: ${project.genre}\nBudget: ₹${project.budget.toLocaleString('en-IN')}\n\nSynopsis:\n${project.description}`)}
                                                    className="px-3 py-1.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                                                >
                                                    View Script
                                                </button>
                                                <button
                                                    disabled={!!processingId}
                                                    onClick={() => handleApprove(project.id)}
                                                    className="px-3 py-1.5 bg-green-950 text-green-400 border border-green-800 rounded-lg hover:bg-green-500 hover:text-black transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={!!processingId}
                                                    onClick={() => handleReject(project.id)}
                                                    className="px-3 py-1.5 bg-red-950 text-red-400 border border-red-800 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingProjects.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-zinc-600">
                                            No scripts awaiting approval.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeAdminTab === 'users' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-serif text-white flex items-center gap-3">
                        <Users className="text-yellow-500" size={20} />
                        User Approvals
                        <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{pendingUsers.length}</span>
                    </h2>

                    <div className="overflow-x-auto bg-zinc-950 border border-zinc-900 rounded-[2rem] p-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Phone Number</th>
                                    <th className="p-4">Registered Role</th>
                                    <th className="p-4">Registration Date</th>
                                    <th className="p-4">Verification Status</th>
                                    <th className="p-4">Approval Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-zinc-300">
                                {pendingUsers.map(u => (
                                    <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-10 h-10 rounded-full bg-zinc-900" />
                                            <span className="font-bold text-white">{u.name}</span>
                                        </td>
                                        <td className="p-4">{u.email}</td>
                                        <td className="p-4">{u.phone || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                u.role === 'DIRECTOR' ? 'bg-purple-900/20 text-purple-400 border border-purple-500/20' :
                                                u.role === 'INVESTOR' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' :
                                                'bg-zinc-800 text-zinc-500'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-zinc-500">{u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A'}</td>
                                        <td className="p-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-yellow-900/20 text-yellow-500 border border-yellow-500/20">
                                                {u.kycStatus || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                                                Awaiting Review
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => verifyUser(u.id, 'VERIFIED')}
                                                    className="px-3 py-1.5 bg-green-950 text-green-500 border border-green-800 rounded-lg hover:bg-green-500 hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => verifyUser(u.id, 'REJECTED')}
                                                    className="px-3 py-1.5 bg-red-950 text-red-500 border border-red-800 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => alert(`User Profile:\n\nName: ${u.name}\nEmail: ${u.email}\nPhone: ${u.phone || 'N/A'}\nRole: ${u.role}\nKYC Status: ${u.kycStatus}`)}
                                                    className="px-3 py-1.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-zinc-600">
                                            No pending user approvals.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeAdminTab === 'investments' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-xl font-serif text-white flex items-center gap-3">
                            <DollarSign className="text-green-500" size={20} />
                            Inbound Capital Verification
                            <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{pendingInvestments.length}</span>
                        </h2>

                        {/* Search input */}
                        <div className="w-full md:w-72">
                            <input
                                type="text"
                                value={investmentSearch}
                                onChange={(e) => setInvestmentSearch(e.target.value)}
                                placeholder="Search UTR, name, email, amount..."
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2 px-4 text-xs text-white outline-none focus:border-yellow-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-zinc-950 border border-zinc-900 rounded-[2rem] p-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Investor</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Project</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4">Txn Ref / UTR</th>
                                    <th className="p-4">Screenshot</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-zinc-300">
                                {pendingInvestments
                                    .filter(inv => {
                                        const q = investmentSearch.toLowerCase().trim();
                                        if (!q) return true;
                                        return (inv.txnId || '').toLowerCase().includes(q) ||
                                               (inv.investor || '').toLowerCase().includes(q) ||
                                               (inv.email || '').toLowerCase().includes(q) ||
                                               (inv.project || '').toLowerCase().includes(q) ||
                                               (inv.id || '').toLowerCase().includes(q) ||
                                               (inv.paymentMethod || '').toLowerCase().includes(q) ||
                                               (inv.amount || 0).toString().includes(q);
                                    })
                                    .map(inv => (
                                        <tr key={inv.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                                            <td className="p-4 font-mono text-zinc-500 text-xs">{inv.date ? new Date(inv.date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="p-4 font-bold text-white">{inv.investor}</td>
                                            <td className="p-4 text-xs font-mono">{inv.email || 'N/A'}</td>
                                            <td className="p-4">{inv.project}</td>
                                            <td className="p-4 text-xs">
                                                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                                                    {inv.paymentMethod || 'Manual'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-yellow-500 font-bold">{inv.txnId}</td>
                                            <td className="p-4">
                                                {inv.screenshot ? (
                                                    <button
                                                        onClick={() => setPreviewScreenshot(inv.screenshot)}
                                                        className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-500/20 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider"
                                                    >
                                                        View Proof
                                                    </button>
                                                ) : (
                                                    <span className="text-zinc-600 text-xs italic">No Proof</span>
                                                )}
                                            </td>
                                            <td className="p-4 font-mono text-green-400">₹{inv.amount.toLocaleString('en-IN')}.00</td>
                                            <td className="p-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => verifyInvestment(inv.id, true)}
                                                        className="px-3 py-1.5 bg-green-950 text-green-400 border border-green-800 rounded-lg hover:bg-green-500 hover:text-black transition-all text-[10px] font-black uppercase tracking-wider"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => verifyInvestment(inv.id, false)}
                                                        className="px-3 py-1.5 bg-red-950 text-red-400 border border-red-800 rounded-lg hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {pendingInvestments.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="p-12 text-center text-zinc-600">No pending transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeAdminTab === 'tickets' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-serif text-white flex items-center gap-3">
                        <Film className="text-yellow-500" size={20} />
                        Ticket Payment Verification
                        <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{pendingBookings.length}</span>
                    </h2>

                    <div className="overflow-x-auto bg-zinc-950 border border-zinc-900 rounded-[2rem] p-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                                    <th className="p-4">Booking ID</th>
                                    <th className="p-4">Movie Name</th>
                                    <th className="p-4">Customer Name</th>
                                    <th className="p-4">Customer Email</th>
                                    <th className="p-4">Phone Number</th>
                                    <th className="p-4">Number of Tickets</th>
                                    <th className="p-4">Total Amount</th>
                                    <th className="p-4">UTR / Ref Number</th>
                                    <th className="p-4">Payment Date & Time</th>
                                    <th className="p-4">Booking Status</th>
                                    <th className="p-4">Payment Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-zinc-300">
                                {pendingBookings.map(b => (
                                    <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4 font-mono font-bold text-white">{b.bookingId}</td>
                                        <td className="p-4">🎬 Vishwavikhyatha Nata Sarvabhouma</td>
                                        <td className="p-4 font-bold text-white">{b.name}</td>
                                        <td className="p-4">{b.email}</td>
                                        <td className="p-4">{b.phone || 'N/A'}</td>
                                        <td className="p-4 font-mono text-yellow-500 font-bold">{b.quantity} Ticket(s)</td>
                                        <td className="p-4 font-mono text-green-400">₹{b.amount.toLocaleString('en-IN')}.00</td>
                                        <td className="p-4 font-mono text-yellow-500 font-bold">{b.utr}</td>
                                        <td className="p-4 font-mono text-zinc-500">{b.createdAt ? new Date(b.createdAt).toLocaleString() : 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                (b.status || '').toUpperCase() === 'CONFIRMED' ? 'bg-green-900/20 text-green-400 border border-green-500/20' :
                                                (b.status || '').toUpperCase() === 'PAYMENT REJECTED' || (b.status || '').toUpperCase() === 'FAILED' ? 'bg-red-900/20 text-red-400 border border-red-500/20' :
                                                'bg-yellow-900/20 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                (b.paymentStatus || '').toUpperCase() === 'VERIFIED' ? 'bg-green-900/20 text-green-400 border border-green-500/20' :
                                                (b.paymentStatus || '').toUpperCase() === 'REJECTED' || (b.paymentStatus || '').toUpperCase() === 'FAILED' ? 'bg-red-900/20 text-red-400 border border-red-500/20' :
                                                'bg-yellow-900/20 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                                {b.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                {((b.status || '').toUpperCase() === 'PENDING' || (b.status || '').toLowerCase() === 'pending admin approval') && (
                                                    <>
                                                        <button
                                                            onClick={() => approveTicketPayment(b.id, b.bookingId, b.quantity)}
                                                            className="px-3 py-1.5 bg-green-950 text-green-400 border border-green-800 rounded-lg hover:bg-green-500 hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
                                                        >
                                                            Approve Payment
                                                        </button>
                                                        <button
                                                            onClick={() => rejectTicketPayment(b.id, b.bookingId)}
                                                            className="px-3 py-1.5 bg-red-950 text-red-400 border border-red-800 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                                                        >
                                                            Reject Payment
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => alert(`Booking Details:\n\nID: ${b.bookingId}\nName: ${b.name}\nEmail: ${b.email}\nPhone: ${b.phone || 'N/A'}\nTickets: ${b.quantity}\nTotal Price: ₹${b.amount}\nUTR ID: ${b.utr}\nStatus: ${b.status}`)}
                                                    className="px-3 py-1.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                                                >
                                                    View Booking Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="p-12 text-center text-zinc-600">
                                            No pending payment verifications.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Inbound payment screenshot preview modal */}
            {previewScreenshot && (
                <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative p-6 space-y-4">
                        <button
                            onClick={() => setPreviewScreenshot(null)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Payment Verification Screenshot Proof</h3>
                        <div className="w-full max-h-[70vh] overflow-auto rounded-xl border border-zinc-900 bg-black flex items-center justify-center">
                            <img src={previewScreenshot} alt="Payment Proof" className="max-w-full max-h-full object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
