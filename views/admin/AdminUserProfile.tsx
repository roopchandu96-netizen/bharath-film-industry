import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/firebase';

export const AdminUserProfile = ({ userId, onClose }: { userId: string, onClose: () => void }) => {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(prof);

      // Fetch bookings to link payments and tickets
      const { data: bookings } = await supabase.from('movie_bookings').select('id, amount, status').eq('user_id', userId);
      const bookingIds = bookings?.map(b => b.id) || [];

      if (bookingIds.length > 0) {
        const { data: pays } = await supabase.from('payments').select('*').in('booking_id', bookingIds);
        const { data: ticks } = await supabase.from('tickets').select('*').in('booking_id', bookingIds);
        setPayments(pays || []);
        setTickets(ticks || []);
      }

      const { data: projs } = await supabase.from('projects').select('*').eq('directorId', userId);
      setScripts(projs || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white">User Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Personal Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl font-bold text-white">
              {profile.name?.charAt(0) || 'U'}
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
              <div className="text-zinc-400">{profile.email} • {profile.phone || 'No phone'}</div>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 rounded bg-slate-800 text-white text-xs font-bold uppercase tracking-wider">{profile.role || 'USER'}</span>
                {profile.kycStatus === 'VERIFIED' ? (
                  <span className="px-3 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck size={12} /> KYC Verified
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold flex items-center gap-1">
                    <Clock size={12} /> KYC Pending
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                Registered: {new Date(profile.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Payments */}
          <div>
            <h4 className="text-lg font-bold text-white border-b border-slate-800 pb-2 mb-4">Payment History</h4>
            {payments.length === 0 ? <p className="text-zinc-500 text-sm">No payments found.</p> : (
              <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-slate-800/50 text-xs uppercase text-zinc-300">
                    <tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Date</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 font-mono text-[10px]">{p.gateway_payment_id || p.id}</td>
                        <td className="px-4 py-2 text-white font-bold">₹{p.amount}</td>
                        <td className="px-4 py-2 text-xs">{(p.payment_status||'').toUpperCase()}</td>
                        <td className="px-4 py-2 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tickets */}
          <div>
            <h4 className="text-lg font-bold text-white border-b border-slate-800 pb-2 mb-4">Tickets & Invoices</h4>
            {tickets.length === 0 ? <p className="text-zinc-500 text-sm">No tickets found.</p> : (
              <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-slate-800/50 text-xs uppercase text-zinc-300">
                    <tr><th className="px-4 py-2">Ticket #</th><th className="px-4 py-2">Invoice #</th><th className="px-4 py-2">Date</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tickets.map(t => (
                      <tr key={t.id}>
                        <td className="px-4 py-2 font-mono text-white">{t.ticket_number}</td>
                        <td className="px-4 py-2 font-mono">{t.invoice_number}</td>
                        <td className="px-4 py-2 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Scripts */}
          {scripts.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-white border-b border-slate-800 pb-2 mb-4">Submitted Scripts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scripts.map(s => (
                  <div key={s.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <h5 className="font-bold text-white">{s.title}</h5>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{s.tagline}</p>
                    <div className="mt-3 flex justify-between items-center text-xs">
                      <span className="text-zinc-500">{s.genre}</span>
                      <span className={`px-2 py-1 rounded font-bold ${(s.status||'').toUpperCase() === 'ACTIVE' || (s.status||'').toUpperCase() === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {(s.status||'PENDING').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
