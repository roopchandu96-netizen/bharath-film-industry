import React, { useState, useEffect } from 'react';
import { Users, Film, DollarSign, Activity, FileText, CheckCircle, Clock, XCircle, Ticket } from 'lucide-react';
import { supabase } from '../../services/firebase';

export const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    investors: 0,
    directors: 0,
    producers: 0,
    writers: 0,
    totalScripts: 0,
    approvedScripts: 0,
    pendingScripts: 0,
    rejectedScripts: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    ticketsSold: 0,
    invoicesGenerated: 0
  });
  
  const [trends, setTrends] = useState({
    revenue: [] as { label: string, value: number }[],
    registrations: [] as { label: string, value: number }[],
    scripts: [] as { label: string, value: number }[]
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data: users } = await supabase.from('profiles').select('id, role, kycStatus, created_at');
      const { data: projects } = await supabase.from('projects').select('id, status, created_at');
      const { data: payments } = await supabase.from('payments').select('id, payment_status, created_at');
      const { data: tickets } = await supabase.from('tickets').select('id, invoice_number');
      const { data: bookings } = await supabase.from('movie_bookings').select('id, amount, status, created_at');

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const monthStartStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      let revenue = 0;
      let todayRev = 0;
      let monthRev = 0;

      const last6Months = Array.from({length: 6}, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return { label: d.toLocaleString('default', { month: 'short' }), month: d.getMonth(), year: d.getFullYear() };
      });

      const revTrend = last6Months.map(m => ({ label: m.label, value: 0 }));
      const regTrend = last6Months.map(m => ({ label: m.label, value: 0 }));
      const scriptTrend = last6Months.map(m => ({ label: m.label, value: 0 }));

      if (bookings) {
        bookings.forEach(b => {
          if ((b.status || '').toUpperCase() === 'CONFIRMED') {
            const amt = Number(b.amount) || 0;
            revenue += amt;
            if (b.created_at.startsWith(todayStr)) todayRev += amt;
            if (b.created_at >= monthStartStr) monthRev += amt;
            
            const bDate = new Date(b.created_at);
            const idx = last6Months.findIndex(m => m.month === bDate.getMonth() && m.year === bDate.getFullYear());
            if (idx >= 0) revTrend[idx].value += amt;
          }
        });
      }

      if (users) {
        users.forEach(u => {
          if (u.created_at) {
            const uDate = new Date(u.created_at);
            const idx = last6Months.findIndex(m => m.month === uDate.getMonth() && m.year === uDate.getFullYear());
            if (idx >= 0) regTrend[idx].value += 1;
          }
        });
      }

      if (projects) {
        projects.forEach(p => {
          if (p.created_at) {
            const pDate = new Date(p.created_at);
            const idx = last6Months.findIndex(m => m.month === pDate.getMonth() && m.year === pDate.getFullYear());
            if (idx >= 0) scriptTrend[idx].value += 1;
          }
        });
      }

      setStats({
        totalUsers: users?.length || 0,
        activeUsers: users?.filter(u => u.kycStatus === 'VERIFIED').length || 0,
        investors: users?.filter(u => u.role === 'INVESTOR').length || 0,
        directors: users?.filter(u => u.role === 'DIRECTOR').length || 0,
        producers: users?.filter(u => u.role === 'PRODUCER').length || 0,
        writers: users?.filter(u => u.role === 'WRITER').length || 0,
        
        totalScripts: projects?.length || 0,
        approvedScripts: projects?.filter(p => (p.status || '').toUpperCase() === 'APPROVED' || (p.status || '').toUpperCase() === 'ACTIVE').length || 0,
        pendingScripts: projects?.filter(p => (p.status || '').toUpperCase() === 'PENDING').length || 0,
        rejectedScripts: projects?.filter(p => (p.status || '').toUpperCase() === 'REJECTED').length || 0,
        
        totalRevenue: revenue,
        todayRevenue: todayRev,
        monthlyRevenue: monthRev,
        
        successfulPayments: payments?.filter(p => (p.payment_status || '').toUpperCase() === 'VERIFIED' || (p.payment_status || '').toUpperCase() === 'SUCCESSFUL').length || 0,
        pendingPayments: payments?.filter(p => (p.payment_status || '').toUpperCase() === 'PENDING').length || 0,
        failedPayments: payments?.filter(p => (p.payment_status || '').toUpperCase() === 'FAILED').length || 0,
        
        ticketsSold: tickets?.length || 0,
        invoicesGenerated: tickets?.filter(t => t.invoice_number).length || 0
      });

      setTrends({ revenue: revTrend, registrations: regTrend, scripts: scriptTrend });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  const SimpleChart = ({ title, data, isCurrency = false }: any) => {
    const maxVal = Math.max(...data.map((d: any) => d.value), 1);
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-white font-bold mb-6">{title}</h3>
        <div className="flex items-end h-40 gap-2 sm:gap-6">
          {data.map((item: any, i: number) => {
            const height = (item.value / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group relative">
                <div className="absolute -top-8 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {isCurrency ? `₹${item.value.toLocaleString()}` : item.value}
                </div>
                <div 
                  className="w-full bg-yellow-500/80 rounded-t-sm hover:bg-yellow-400 transition-colors"
                  style={{ height: `${Math.max(height, 2)}%` }}
                ></div>
                <div className="text-[10px] text-zinc-500">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} colorClass="bg-green-500 text-green-500" />
          <StatCard title="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} icon={DollarSign} colorClass="bg-emerald-500 text-emerald-500" />
          <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} colorClass="bg-teal-500 text-teal-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SimpleChart title="Revenue (Last 6 Months)" data={trends.revenue} isCurrency={true} />
        <SimpleChart title="User Registrations" data={trends.registrations} />
        <SimpleChart title="Script Submissions" data={trends.scripts} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">User Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} colorClass="bg-blue-500 text-blue-500" />
          <StatCard title="Active (KYC)" value={stats.activeUsers} icon={Activity} colorClass="bg-green-500 text-green-500" />
          <StatCard title="Investors" value={stats.investors} icon={Users} colorClass="bg-purple-500 text-purple-500" />
          <StatCard title="Directors" value={stats.directors} icon={Users} colorClass="bg-yellow-500 text-yellow-500" />
          <StatCard title="Producers" value={stats.producers} icon={Users} colorClass="bg-pink-500 text-pink-500" />
          <StatCard title="Writers" value={stats.writers} icon={Users} colorClass="bg-orange-500 text-orange-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Scripts & Projects</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Scripts" value={stats.totalScripts} icon={Film} colorClass="bg-indigo-500 text-indigo-500" />
            <StatCard title="Approved" value={stats.approvedScripts} icon={CheckCircle} colorClass="bg-green-500 text-green-500" />
            <StatCard title="Pending" value={stats.pendingScripts} icon={Clock} colorClass="bg-yellow-500 text-yellow-500" />
            <StatCard title="Rejected" value={stats.rejectedScripts} icon={XCircle} colorClass="bg-red-500 text-red-500" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Ticketing & Payments</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Tickets Sold" value={stats.ticketsSold} icon={Ticket} colorClass="bg-yellow-500 text-yellow-500" />
            <StatCard title="Invoices Generated" value={stats.invoicesGenerated} icon={FileText} colorClass="bg-blue-500 text-blue-500" />
            <StatCard title="Successful Payments" value={stats.successfulPayments} icon={CheckCircle} colorClass="bg-green-500 text-green-500" />
            <StatCard title="Pending Payments" value={stats.pendingPayments} icon={Clock} colorClass="bg-amber-500 text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
