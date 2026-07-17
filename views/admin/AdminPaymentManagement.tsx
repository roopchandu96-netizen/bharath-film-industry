import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/firebase';
import { ExportButtons, exportToCSV, exportToPDF } from './AdminExport';

export const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data: paymentsData } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      const { data: bookingsData } = await supabase.from('movie_bookings').select('id, name, email, phone, status');
      const { data: ticketsData } = await supabase.from('tickets').select('booking_id, ticket_number, invoice_number');

      if (paymentsData) {
        const enriched = paymentsData.map(p => {
          const booking = bookingsData?.find(b => b.id === p.booking_id);
          const ticket = ticketsData?.find(t => t.booking_id === p.booking_id);
          return {
            ...p,
            userName: booking?.name || p.user_id,
            email: booking?.email || '-',
            phone: booking?.phone || '-',
            ticketNumber: ticket?.ticket_number || '-',
            invoiceNumber: ticket?.invoice_number || '-'
          };
        });
        setPayments(enriched);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const data = payments.map(p => ({
      PaymentID: p.id,
      RazorpayID: p.gateway_payment_id || '-',
      Amount: p.amount,
      Currency: 'INR',
      Status: (p.payment_status || 'PENDING').toUpperCase(),
      User: p.userName,
      Email: p.email,
      Date: new Date(p.created_at).toLocaleString()
    }));
    exportToCSV(data, 'BFI_Payments_Export');
  };

  const handleExportPDF = () => {
    const headers = ['Payment ID', 'Razorpay ID', 'User', 'Amount', 'Status', 'Date'];
    const rows = payments.map(p => [
      p.id.substring(0, 8) + '...',
      p.gateway_payment_id || '-',
      p.userName,
      `Rs ${p.amount}`,
      (p.payment_status || 'PENDING').toUpperCase(),
      new Date(p.created_at).toLocaleDateString()
    ]);
    exportToPDF('BFI Payment History', headers, rows);
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      (p.id || '').includes(searchTerm) || 
      (p.gateway_payment_id || '').includes(searchTerm) ||
      (p.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const pStatus = (p.payment_status || 'PENDING').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'SUCCESSFUL' && (pStatus === 'VERIFIED' || pStatus === 'SUCCESSFUL')) ||
                          (statusFilter === pStatus);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'VERIFIED' || s === 'SUCCESSFUL') {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1 w-fit">
          <CheckCircle size={12} /> Successful
        </span>
      );
    }
    if (s === 'FAILED') {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 w-fit">
          <XCircle size={12} /> Failed
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1 w-fit">
        <Clock size={12} /> Pending
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Payment Management
          <button onClick={fetchPayments} className="p-1 hover:bg-slate-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search ID, email, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 w-full sm:w-64"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESSFUL">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-zinc-300">
            <tr>
              <th className="px-4 py-3">Transaction</th>
              <th className="px-4 py-3">User Details</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Docs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading payments...</td></tr>
            ) : filteredPayments.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8">No payments found</td></tr>
            ) : (
              filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-white">ID: {payment.id.substring(0, 12)}...</div>
                    <div className="font-mono text-[10px] text-zinc-500">RZP: {payment.gateway_payment_id || 'Pending'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{payment.userName}</div>
                    <div className="text-xs">{payment.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-bold">₹{payment.amount}</div>
                    <div className="text-[10px] text-zinc-500">INR • {payment.payment_method || 'Razorpay'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(payment.payment_status)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div>{new Date(payment.created_at).toLocaleDateString()}</div>
                    <div className="text-zinc-500 text-[10px]">{new Date(payment.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-mono">T: {payment.ticketNumber}</div>
                    <div className="font-mono">I: {payment.invoiceNumber}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
