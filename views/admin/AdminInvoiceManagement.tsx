import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer } from 'lucide-react';
import { supabase } from '../../services/firebase';
import { ExportButtons, exportToCSV, exportToPDF } from './AdminExport';

export const AdminInvoiceManagement = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data: ticketsData } = await supabase.from('tickets').select('*').not('invoice_number', 'is', null).order('created_at', { ascending: false });
      const { data: bookingsData } = await supabase.from('movie_bookings').select('id, name, email, amount, status, payment_status');

      if (ticketsData) {
        const enriched = ticketsData.map(t => {
          const booking = bookingsData?.find(b => b.id === t.booking_id);
          const amount = Number(booking?.amount || 0);
          const gst = amount * (18/118);
          const baseAmount = amount - gst;
          return {
            ...t,
            userName: booking?.name || 'Unknown',
            email: booking?.email || 'N/A',
            amount,
            gst,
            baseAmount,
            status: booking?.payment_status || 'PENDING'
          };
        });
        setInvoices(enriched);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceHTML = (inv: any) => {
    return `
      <html>
        <head>
          <title>Invoice ${inv.invoice_number}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eab308; padding-bottom: 20px; mb-6 }
            .logo { font-size: 24px; font-weight: bold; color: #eab308; }
            .invoice-title { font-size: 28px; font-weight: bold; color: #111; }
            .details { display: flex; justify-content: space-between; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 40px; }
            th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .totals { width: 50%; float: right; margin-top: 20px; }
            .totals table th, .totals table td { border: none; padding: 8px; }
            .totals table tr:last-child { border-top: 2px solid #eab308; font-weight: bold; font-size: 1.1em; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">BHARATH FILM INDUSTRY</div>
              <div>GSTIN: 37CZVPR2615G1ZU</div>
              <div>Reg: UDYAM-AP-23-0080757</div>
            </div>
            <div style="text-align: right">
              <div class="invoice-title">TAX INVOICE</div>
              <div><strong>No:</strong> ${inv.invoice_number}</div>
              <div><strong>Date:</strong> ${new Date(inv.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="details">
            <div>
              <strong>Billed To:</strong><br>
              ${inv.userName}<br>
              ${inv.email}
            </div>
            <div style="text-align: right">
              <strong>Status:</strong> ${(inv.status || '').toUpperCase() === 'VERIFIED' ? 'PAID' : 'PENDING'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>SAC Code</th>
                <th style="text-align: right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Digital Content Access - Ticket ${inv.ticket_number}</td>
                <td>999614</td>
                <td style="text-align: right">₹${inv.baseAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <table style="width: 100%">
              <tr><td>Taxable Amount:</td><td style="text-align: right">₹${inv.baseAmount.toFixed(2)}</td></tr>
              <tr><td>CGST (9%):</td><td style="text-align: right">₹${(inv.gst/2).toFixed(2)}</td></tr>
              <tr><td>SGST (9%):</td><td style="text-align: right">₹${(inv.gst/2).toFixed(2)}</td></tr>
              <tr><td><strong>Total Amount:</strong></td><td style="text-align: right"><strong>₹${inv.amount.toFixed(2)}</strong></td></tr>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = (inv: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateInvoiceHTML(inv));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    }
  };

  const filteredInvoices = invoices.filter(i => 
    (i.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Invoice Management</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 w-full"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-zinc-300">
            <tr>
              <th className="px-4 py-3">Invoice No</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount & GST</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading invoices...</td></tr>
            ) : filteredInvoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-white">{inv.invoice_number}</td>
                <td className="px-4 py-3">
                  <div className="text-white">{inv.userName}</div>
                  <div className="text-xs">{inv.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-white font-bold">₹{inv.amount.toFixed(2)}</div>
                  <div className="text-[10px] text-zinc-500">GST: ₹{inv.gst.toFixed(2)}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(inv.status||'').toUpperCase() === 'VERIFIED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {(inv.status||'PENDING').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex justify-end gap-2">
                  <button onClick={() => handlePrint(inv)} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors" title="Print/View">
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
