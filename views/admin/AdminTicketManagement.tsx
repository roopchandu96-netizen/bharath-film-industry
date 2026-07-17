import React, { useState, useEffect } from 'react';
import { Search, Printer } from 'lucide-react';
import { supabase } from '../../services/firebase';

export const AdminTicketManagement = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data: ticketsData } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      const { data: bookingsData } = await supabase.from('movie_bookings').select('id, name, email, phone, status, payment_status, amount, quantity, created_at');

      if (ticketsData) {
        const enriched = ticketsData.map(t => {
          const booking = bookingsData?.find(b => b.id === t.booking_id);
          return {
            ...t,
            userName: booking?.name || 'Unknown',
            email: booking?.email || 'N/A',
            phone: booking?.phone || 'N/A',
            amount: booking?.amount || 0,
            quantity: booking?.quantity || 1,
            bookingStatus: booking?.status || 'PENDING',
            paymentStatus: booking?.payment_status || 'PENDING',
            bookingDate: booking?.created_at || t.created_at
          };
        });
        setTickets(enriched);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (ticket: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>BFI Ticket - ${ticket.ticket_number}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #000; color: #fff; padding: 20px; text-align: center; }
            .ticket-card { background: #111; border: 1px solid #333; border-radius: 16px; max-width: 600px; margin: 0 auto; padding: 30px; position: relative; overflow: hidden; }
            .header { color: #eab308; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
            .movie-title { font-size: 28px; font-weight: bold; margin: 10px 0; color: #fff; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; margin: 30px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px; }
            .label { color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: bold; }
            .status { margin-top: 20px; padding: 10px; background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="header">BHARATH FILM INDUSTRY</div>
            <div class="movie-title">Vishwavikhyatha Nata Sarvabhouma</div>
            
            <div class="details">
              <div>
                <div class="label">Ticket Number</div>
                <div class="value" style="color: #eab308; font-family: monospace">${ticket.ticket_number}</div>
              </div>
              <div>
                <div class="label">Booking Ref</div>
                <div class="value" style="font-family: monospace">${ticket.booking_id}</div>
              </div>
              <div>
                <div class="label">Admit</div>
                <div class="value">${ticket.userName}</div>
              </div>
              <div>
                <div class="label">Date</div>
                <div class="value">${new Date(ticket.bookingDate).toLocaleDateString()}</div>
              </div>
            </div>

            <div class="status">
              ${ticket.bookingStatus.toUpperCase() === 'CONFIRMED' ? '✓ ACTIVE DIGITAL PASS' : 'PENDING ACTIVATION'}
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Keep this ticket safe. Valid for one digital viewing on official premiere date.
            </p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const filteredTickets = tickets.filter(t => 
    (t.ticket_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Ticket Management</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-zinc-300">
            <tr>
              <th className="px-4 py-3">Ticket No</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading tickets...</td></tr>
            ) : filteredTickets.map(t => (
              <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-white">{t.ticket_number}</td>
                <td className="px-4 py-3">
                  <div className="text-white">{t.userName}</div>
                  <div className="text-xs">{t.email}</div>
                </td>
                <td className="px-4 py-3 font-bold text-white">{t.quantity}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(t.bookingStatus||'').toUpperCase() === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {(t.bookingStatus||'PENDING').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex justify-end">
                  <button onClick={() => handlePrint(t)} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors" title="Print Ticket">
                    <Printer size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
