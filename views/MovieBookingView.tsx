import React, { useState, useEffect } from 'react';
import { 
  Film, Sparkles, AlertCircle, CheckCircle, Download, CreditCard, 
  QrCode, Landmark, ShieldCheck, Mail, Phone, User as UserIcon, Ticket, FileText, ChevronRight, Copy, Printer, Play, Lock, AlertTriangle, Clock, X
} from 'lucide-react';
import { db, supabase } from '../services/firebase';
import { User, UserRole } from '../types';
import { updateUserInFirestore } from '../services/userService';


interface BookingRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  txnId: string;
  paymentMethod: string;
  amount: number;
  quantity: number;
  date: string;
  status: string;
  watched?: boolean;
  bookingRef?: string;
  invoiceNumber?: string | null;
  ticketNumbers?: string;
  paymentStatus?: string;
}

interface MovieBookingViewProps {
  user: User | null;
}

export const MovieBookingView: React.FC<MovieBookingViewProps> = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY'>('RAZORPAY');
  const [step, setStep] = useState<'FORM' | 'PAY_PROCESSING' | 'PAY_FAILED' | 'PAY_CANCELLED' | 'PAY_CONFIRMED'>('FORM');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'PENDING_HANDSHAKE' | 'AWAITING_CALLBACK' | 'SUCCESS' | 'FAILED'>('PENDING_HANDSHAKE');
  const [gatewayProgress, setGatewayProgress] = useState(0);
  const [bookingHistory, setBookingHistory] = useState<BookingRecord[]>([]);
  const [currentBooking, setCurrentBooking] = useState<BookingRecord | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'BOOKING' | 'HISTORY'>('BOOKING');
  const [switchingRole, setSwitchingRole] = useState(false);

  const [posterLanguage, setPosterLanguage] = useState<'EN' | 'TE'>('TE');
  const [activeMediaTab, setActiveMediaTab] = useState<'LAUNCH' | 'TRACK'>('LAUNCH');

  const [showSwitchGateModal, setShowSwitchGateModal] = useState(false);
  const [isSwitchingGate, setIsSwitchingGate] = useState(false);

  const handleGateSwitchToMovieLover = async () => {
    setIsSwitchingGate(true);
    try {
      if (!user?.movieLoverActivated) {
        const confirmSwitch = window.confirm(
          "Become a Movie Lover\n\nSupport original cinema and enjoy exclusive movie pre-bookings, premieres, and future benefits.\n\nContinue?"
        );
        if (!confirmSwitch) {
          setIsSwitchingGate(false);
          return;
        }
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: { role: UserRole.MOVIE_LOVER, active_role: UserRole.MOVIE_LOVER }
      });
      if (authError) throw authError;

      localStorage.setItem(`bfi_active_role_${user!.id}`, UserRole.MOVIE_LOVER);

      await updateUserInFirestore(user!.id, {
        activeRole: UserRole.MOVIE_LOVER,
        role: UserRole.MOVIE_LOVER,
        movieLoverActivated: true
      });

      alert("Role Switch Success: Movie Lover mode activated!");
      window.location.reload();
    } catch (err: any) {
      console.error("Gate role switch failed:", err);
      localStorage.setItem(`bfi_active_role_${user!.id}`, UserRole.MOVIE_LOVER);
      await updateUserInFirestore(user!.id, {
        activeRole: UserRole.MOVIE_LOVER,
        role: UserRole.MOVIE_LOVER,
        movieLoverActivated: true
      });
      window.location.reload();
    } finally {
      setIsSwitchingGate(false);
      setShowSwitchGateModal(false);
    }
  };

  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    loadBookingHistory();
  }, [user]);

  const loadBookingHistory = async () => {
    if (!user) {
      setBookingHistory([]);
      return;
    }
    try {
      // Step 1: Fetch bookings (flat query — no joins to avoid PGRST200 FK cache issue)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('movie_bookings')
        .select('id, booking_id, amount, status, payment_status, created_at, confirmed_at, quantity, phone, email, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      if (!bookingsData || bookingsData.length === 0) {
        setBookingHistory([]);
        return;
      }

      const bookingIds = bookingsData.map((b: any) => b.id);

      // Step 2: Fetch tickets for these bookings
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('booking_id, ticket_number, invoice_number')
        .in('booking_id', bookingIds);

      // Step 3: Fetch payments for these bookings
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('booking_id, gateway_payment_id, payment_status')
        .in('booking_id', bookingIds);

      // Step 4: Build lookup maps
      const ticketsByBooking: Record<string, any[]> = {};
      for (const t of (ticketsData || [])) {
        if (!ticketsByBooking[t.booking_id]) ticketsByBooking[t.booking_id] = [];
        ticketsByBooking[t.booking_id].push(t);
      }

      const paymentsByBooking: Record<string, any[]> = {};
      for (const p of (paymentsData || [])) {
        if (!paymentsByBooking[p.booking_id]) paymentsByBooking[p.booking_id] = [];
        paymentsByBooking[p.booking_id].push(p);
      }

      // Step 5: Format bookings with joined data
      const formattedBookings: BookingRecord[] = bookingsData.map((b: any) => {
        const tickets = ticketsByBooking[b.id] || [];
        const payments = paymentsByBooking[b.id] || [];
        const ticketNumbers = tickets.length > 0 
          ? tickets.map((t: any) => t.ticket_number).join(', ') 
          : '';
        return {
          id: b.id,
          name: b.name || user?.name || '',
          email: b.email || user?.email || '',
          phone: b.phone || '',
          txnId: payments[0]?.gateway_payment_id || 'N/A',
          paymentMethod: 'Razorpay',
          amount: Number(b.amount),
          quantity: b.quantity || 1,
          date: b.created_at,
          status: (b.status || 'pending').toUpperCase(),
          paymentStatus: (() => {
            const ps = (payments[0]?.payment_status || b.payment_status || 'pending').toLowerCase();
            if (ps === 'verified' || ps === 'successful') return 'Successful';
            if (ps === 'pending') return 'Pending';
            if (ps === 'failed') return 'Failed';
            return ps;
          })(),
          watched: false,
          bookingRef: b.booking_id,
          invoiceNumber: tickets[0]?.invoice_number || null,
          ticketNumbers: ticketNumbers
        };
      });

      setBookingHistory(formattedBookings);
    } catch (err) {
      console.error("Failed to load booking history from Supabase:", err);
      setBookingHistory([]);
    }
  };

  const handleClaimPayment = async (bookingRef: string) => {
    const paymentId = prompt("Please enter the Razorpay Payment ID (starts with pay_...) from your receipt:");
    if (!paymentId) return;
    
    if (!paymentId.trim().startsWith('pay_')) {
      alert("Invalid format. Razorpay Payment IDs must start with 'pay_'.");
      return;
    }
    
    setIsClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          razorpay_payment_id: paymentId.trim(),
          booking_ref: bookingRef,
          razorpay_signature: 'manual_recovery'
        }
      });
      
      if (error) throw error;
      
      alert("Success! Your payment was verified and your ticket has been generated.");
      await loadBookingHistory();
    } catch (err: any) {
      console.error("Claim failed:", err);
      alert("Verification failed: " + (err.message || "Please make sure the Payment ID matches this booking's amount and reference."));
    } finally {
      setIsClaiming(false);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      alert('Please fill in all details.');
      return;
    }
    if (!acceptedTerms) {
      alert('Please accept the pre-booking terms & conditions.');
      return;
    }
    handleRazorpayPayment();
  };


  const handleRazorpayPayment = async () => {
    setStep('PAY_PROCESSING');
    setGatewayProgress(10);
    setGatewayStatus('PENDING_HANDSHAKE');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          quantity: quantity,
          phone: phone,
          name: name
        }
      });
      
      if (error) throw error;
      
      setGatewayProgress(30);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TCx8Bwnh4y2e2A',
        amount: data.amount,
        currency: data.currency,
        name: "BHARAT FILM INDUSTRY�",
        description: `Pre-booking for ${quantity} Ticket(s)`,
        order_id: data.order_id,
        handler: async function (response: any) {
          setGatewayProgress(60);
          setGatewayStatus('AWAITING_CALLBACK');
          
          try {
            const { data: verifyData, error: verifyErr } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            });
            
            if (verifyErr) throw verifyErr;
            
            setGatewayProgress(100);
            
            const confirmedBooking: BookingRecord = {
              id: verifyData.booking?.id || data.booking_id,
              bookingRef: data.booking_id,
              name,
              email,
              phone,
              txnId: response.razorpay_payment_id,
              paymentMethod: 'Razorpay',
              amount: 59 * quantity,
              quantity,
              date: new Date().toISOString(),
              status: 'CONFIRMED',
              watched: false
            };
            
            setCurrentBooking(confirmedBooking);
            await loadBookingHistory();
            setStep('PAY_CONFIRMED');
          } catch (err: any) {
            console.error("Verification failed:", err);
            alert("Payment verification failed: " + (err.message || err));
            setStep('PAY_FAILED');
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: "#EAB308"
        },
        modal: {
          ondismiss: function () {
            setStep('PAY_CANCELLED');
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay checkout failed:", err);
      alert("Failed to initialize Razorpay checkout: " + (err.message || err));
      setStep('FORM');
    }
  };
  const printTicket = (booking: BookingRecord) => {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>BFI Digital Ticket - ${booking.id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; padding: 40px; margin: 0; color: #1e293b; }
            .ticket-card { background: white; border-radius: 20px; border: 2px dashed #cbd5e1; max-width: 450px; margin: auto; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .header { background: #0f172a; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; color: #facc15; }
            .header p { margin: 5px 0 0 0; font-size: 11px; opacity: 0.8; font-weight: bold; }
            .content { padding: 30px; }
            .movie-title { font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 25px; color: #0f172a; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
            .label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            .val { font-weight: 700; color: #0f172a; }
            .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: bold; background: #dcfce7; color: #166534; }
            .pending-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: bold; background: #fef9c3; color: #854d0e; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .qr-placeholder { width: 120px; height: 120px; border: 2px solid #e2e8f0; margin: 20px auto; display: flex; align-items: center; justify-content: center; background: white; }
            .print-btn { display: block; width: 100%; max-width: 200px; margin: 20px auto; padding: 10px; text-align: center; background: #0f172a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="header">
              <h1>BHARAT FILM INDUSTRY�</h1>
              <p>OFFICIAL DIGITAL TICKET</p>
            </div>
            <div class="content">
              <div class="movie-title">🎬 Vishwavikhyatha Nata Sarvabhouma</div>
              
              <div class="detail-row">
                <span class="label">Ticket ID</span>
                <span class="val" style="color: #c2410c;">${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="label">Ticket Qty</span>
                <span class="val">${booking.quantity} Ticket(s)</span>
              </div>
              <div class="detail-row">
                <span class="label">Holder Name</span>
                <span class="val">${booking.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Registered Email</span>
                <span class="val">${booking.email}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Paid</span>
                <span class="val">₹${booking.amount.toFixed(2)} (GST Inc.)</span>
              </div>
              <div class="detail-row">
                <span class="label">Booking Date</span>
                <span class="val">${new Date(booking.date).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Access Status</span>
                <span class="${booking.paymentStatus === 'Successful' || booking.status.toUpperCase() === 'CONFIRMED' ? 'status-badge' : 'pending-badge'}">
                  ${booking.paymentStatus === 'Successful' || booking.status.toUpperCase() === 'CONFIRMED' ? 'ACTIVE PASS' : 'PENDING CLEARANCE'}
                </span>
              </div>

              <div class="qr-placeholder">
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; width: 80px; height: 80px;">
                  <div style="background: black;"></div><div style="background: black;"></div><div style="background: white;"></div><div style="background: black;"></div><div style="background: black;"></div>
                  <div style="background: black;"></div><div style="background: white;"></div><div style="background: black;"></div><div style="background: white;"></div><div style="background: black;"></div>
                  <div style="background: white;"></div><div style="background: black;"></div><div style="background: black;"></div><div style="background: black;"></div><div style="background: white;"></div>
                  <div style="background: black;"></div><div style="background: white;"></div><div style="background: black;"></div><div style="background: white;"></div><div style="background: black;"></div>
                  <div style="background: black;"></div><div style="background: black;"></div><div style="background: white;"></div><div style="background: black;"></div><div style="background: black;"></div>
                </div>
              </div>
            </div>
            <div class="footer">
              <strong>One-Time Viewing DRM Enabled</strong><br/>
              Your secure movie premiere link is issued to your registered email account and can be opened in your account dashboard. It allows for a single viewing session only.
            </div>
          </div>
          <button class="print-btn" onclick="window.print()">Print Ticket</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printInvoice = (booking: BookingRecord) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const baseAmount = 50.00 * booking.quantity;
    const cgst = 4.50 * booking.quantity;
    const sgst = 4.50 * booking.quantity;

    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${booking.invoiceNumber || booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); border-radius: 10px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .header-table td { vertical-align: top; }
            .title { font-size: 24px; font-weight: bold; color: #000; }
            .company-details { text-align: right; font-size: 12px; }
            .invoice-details { margin-bottom: 30px; font-size: 14px; }
            .billing-details { margin-bottom: 30px; }
            .billing-title { font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
            .line-items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .line-items th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; }
            .line-items td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 13px; }
            .totals-table { width: 40%; margin-left: auto; border-collapse: collapse; margin-top: 20px; }
            .totals-table td { padding: 8px 10px; font-size: 13px; }
            .grand-total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; border-bottom: 2px solid #000; }
            .footer { text-align: center; font-size: 10px; color: #777; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
            .print-btn { display: block; width: 100%; max-width: 200px; margin: 20px auto; padding: 10px; text-align: center; background: #000; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table class="header-table">
              <tr>
                <td>
                  <span class="title">TAX INVOICE</span><br/>
                  <span style="font-size: 14px; font-weight: bold; color: #c2410c;">BHARAT BFI</span>
                </td>
                <td class="company-details">
                  <strong>BHARAT FILM INDUSTRY�</strong><br/>
                  Registration No: UDYAM-AP-23-0080757<br/>
                  GSTIN: 37CZVPR2615G1ZU<br/>
                  Email: bharathfilmindustry@gmail.com
                </td>
              </tr>
            </table>

            <div class="invoice-details">
              <strong>Invoice Number:</strong> ${booking.invoiceNumber || 'INV-' + booking.id}<br/><br/>
              <strong>Date of Issue:</strong> ${new Date(booking.date).toLocaleDateString()}<br/>
              <strong>Payment Status:</strong> ${booking.paymentStatus === 'Successful' || booking.status.toUpperCase() === 'CONFIRMED' ? 'PAID' : 'PENDING VERIFICATION'}<br/>
              <strong>Transaction UTR/ID:</strong> ${booking.txnId}
            </div>

            <div class="billing-details">
              <div class="billing-title">Billed To</div>
              <table style="width: 100%;">
                <tr>
                  <td style="font-size: 13px;">
                    <strong>Name:</strong> ${booking.name}<br/>
                    <strong>Email:</strong> ${booking.email}<br/>
                    <strong>Phone:</strong> ${booking.phone}
                  </td>
                </tr>
              </table>
            </div>

            <table class="line-items">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>SAC Code</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Taxable Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Movie Ticket Pre-Booking</strong><br/>
                    Movie: Vishwavikhyatha Nata Sarvabhouma
                  </td>
                  <td>999612</td>
                  <td>${booking.quantity}</td>
                  <td>₹50.00</td>
                  <td>₹${baseAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <table class="totals-table">
              <tr>
                <td>Taxable Value:</td>
                <td style="text-align: right;">₹${baseAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>CGST (9%):</td>
                <td style="text-align: right;">₹${cgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td>SGST (9%):</td>
                <td style="text-align: right;">₹${sgst.toFixed(2)}</td>
              </tr>
              <tr class="grand-total">
                <td>Total (Inc. GST):</td>
                <td style="text-align: right;">₹${booking.amount.toFixed(2)}</td>
              </tr>
            </table>

            <div class="footer">
              This is a computer-generated GST tax invoice. No signature is required.<br/>
              Thank you for supporting independent cinema. Cinema Powered by the Audience.
            </div>
          </div>
          <button class="print-btn" onclick="window.print()">Print / Download PDF</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };



  const startNewBooking = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone('');
    setQuantity(1);
    setAcceptedTerms(false);
    setCurrentBooking(null);
    setStep('FORM');
    setActiveSubTab('BOOKING');
  };



  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-in fade-in duration-700 text-slate-200">
      

      
      {/* Tab Selector */}
      <div className="flex justify-center">
        <div className="flex p-1 bg-slate-950 border border-white/5 rounded-full shadow-lg">
          <button 
            onClick={() => setActiveSubTab('BOOKING')}
            className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === 'BOOKING' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket size={14} /> Buy Tickets
          </button>
          <button 
            onClick={() => { setActiveSubTab('HISTORY'); loadBookingHistory(); }}
            className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === 'HISTORY' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} /> My Tickets ({bookingHistory.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'BOOKING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Manifesto & Poster */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-slate-950/40 border border-slate-900 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-48 rounded-2xl overflow-hidden border border-yellow-500/20 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
                    <img 
                      src={posterLanguage === 'EN' ? "/sarvabhouma_english.jpg" : "/sarvabhouma_telugu.jpg"} 
                      alt="Vishwavikhyatha Nata Sarvabhouma Poster" 
                      className="w-full object-cover aspect-[2/3] group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-3 left-3 z-20">
                      <span className="px-2 py-0.5 rounded bg-yellow-500 text-black text-[9px] font-black uppercase tracking-wider">OFFICIAL PRE-BOOKING</span>
                    </div>
                  </div>
                  {/* Language Selector */}
                  <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-full max-w-[12rem] shadow-md">
                    <button
                      type="button"
                      onClick={() => setPosterLanguage('EN')}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        posterLanguage === 'EN' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterLanguage('TE')}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        posterLanguage === 'TE' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      తెలుగు
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles size={10} /> Exclusive Booking
                  </span>
                  <h1 className="text-3xl md:text-4xl font-serif text-white leading-tight">
                    Vishwavikhyatha Nata Sarvabhouma
                  </h1>
                  <p className="text-yellow-500 font-mono text-xs uppercase tracking-widest font-black">
                    A New Beginning for Indian Cinema
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    A movie doesn't begin when it releases. It begins when movie lovers believe in it. 
                    Support independent storytelling and emergent creative talent through BHARAT FILM INDUSTRY�.
                  </p>
                </div>
              </div>

              <hr className="border-slate-900" />

              {/* About the Movie */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Film size={14} className="text-yellow-500" /> About the Movie
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  <strong className="text-white">Vishwavikhyatha Nata Sarvabhouma</strong> is a <strong className="text-yellow-500">multilingual Periodic Fictional Drama</strong> crafted for audiences across India and beyond.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Set against a rich historical backdrop, the film blends powerful storytelling, intense action, emotional depth, cultural heritage, and cinematic grandeur to deliver a complete entertainment experience for viewers of all ages.
                </p>
                
                {/* Highlights grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-bold text-slate-300">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">🌍 Multilingual Release</div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">🎭 Periodic Drama</div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">⚔️ Action &amp; Adventure</div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">❤️ Emotional Story</div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">🎬 Family Entertainer</div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">🎼 Powerful Score</div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">🏛️ Heritage &amp; Culture</div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">✨ Grand Cinema</div>
                </div>
              </div>

              <hr className="border-slate-900" />

              {/* Why Pre-Book? */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Why Pre-Book?</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  For just <strong className="text-yellow-500">₹59 (Inclusive of GST)</strong>—less than the price of many everyday purchases—you can help bring this cinematic vision to life.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Your pre-booking directly supports independent filmmaking, empowers emerging talent, and helps create a new future where audiences actively participate in making great cinema.
                </p>
                
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl space-y-1.5 text-center">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">"You are not just buying a ticket. You are becoming part of the journey."</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Watch. Support. Inspire. • BHARAT FILM INDUSTRY�</p>
                </div>
              </div>

              <hr className="border-slate-900" />

              {/* Deliverables */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">What You Receive</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                  <li className="flex items-center gap-2">✅ Official Digital Movie Ticket</li>
                  <li className="flex items-center gap-2">✅ GST Invoice sent instantly to your email</li>
                  <li className="flex items-center gap-2">✅ Booking Confirmation</li>
                  <li className="flex items-center gap-2">✅ Secure Ticket ID</li>
                  <li className="flex items-center gap-2">✅ Secure movie access link on release</li>
                </ul>
              </div>

              <hr className="border-slate-900" />

              {/* Release details */}
              <div className="space-y-4 bg-yellow-500/5 border border-yellow-500/10 p-5 rounded-2xl">
                <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> Secure Viewing &amp; Release Info
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When the movie is officially released, you will automatically receive an email containing your personal, unique viewing link. 
                  This link is restricted to a single viewing session, cannot be reused, is protected against unauthorized sharing, and is only available for your registered booking email.
                </p>
              </div>
              <hr className="border-slate-900" />

              {/* Promotional Media Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Play size={14} className="text-yellow-500" fill="currentColor" /> Cinematic Media &amp; Launch
                </h3>
                
                {/* Media tabs */}
                <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('LAUNCH')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      activeMediaTab === 'LAUNCH' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Title Launch Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('TRACK')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      activeMediaTab === 'TRACK' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Official Title Track
                  </button>
                </div>

                {/* Video container */}
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
                  <iframe
                    src={activeMediaTab === 'LAUNCH' ? "https://www.youtube.com/embed/wRKvoTNdJyw" : "https://www.youtube.com/embed/qfxiyIZWgYE"}
                    title={activeMediaTab === 'LAUNCH' ? "Title Launch Video" : "Official Title Track"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>

              <hr className="border-slate-900" />

              {/* Terms Accordion */}
              <details className="group border border-slate-900 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-400 group-open:text-white uppercase tracking-wider">
                  <span>Terms &amp; Conditions</span>
                  <ChevronRight size={14} className="transition-transform group-open:rotate-90" />
                </summary>
                <div className="mt-4 border-t border-slate-900 pt-4 space-y-2 text-[10px] text-slate-500 leading-relaxed max-h-48 overflow-y-auto">
                  <p>1. This is an official pre-booking ticket for <em>Vishwavikhyatha Nata Sarvabhouma</em>.</p>
                  <p>2. Ticket price is ₹59 inclusive of applicable GST.</p>
                  <p>3. A GST invoice and digital ticket will be automatically emailed after successful payment.</p>
                  <p>4. The registered email address must be valid, as all future communication and movie access will be sent to that email.</p>
                  <p>5. Upon official release of the movie, customers will receive a secure one-time movie viewing link.</p>
                  <p>6. The movie viewing link is intended for a single viewing session. Once activated and used, it cannot be reused.</p>
                  <p>7. Sharing, copying, recording, redistributing, or attempting to bypass the security of the viewing system is strictly prohibited.</p>
                  <p>8. The movie access link is non-transferable and is issued only to the purchaser's registered email.</p>
                  <p>9. The release date may change due to production, technical, certification, or regulatory requirements.</p>
                  <p>10. Refunds are generally not available after successful booking, except where required by applicable law.</p>
                  <p>11. BHARAT FILM INDUSTRY� reserves the right to update these terms whenever necessary.</p>
                </div>
              </details>
            </div>
          </div>

          {/* Right Column: Checkout Workflow */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-yellow-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

              {/* Price Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-1 mb-8 relative">
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-wider animate-pulse">41% Off</span>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Ticket Price (Per Unit)</p>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-zinc-500 line-through text-lg font-bold">₹100</span>
                  <span className="text-4xl font-serif text-yellow-500 font-bold">₹59</span>
                </div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Inclusive of 18% GST (₹50 Base + ₹9 Tax)</p>
              </div>

              {!user ? (
                <div className="text-center p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center mx-auto">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Required</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Please log in to pre-book tickets and receive viewing links.
                  </p>
                  <a 
                    href="/#/register" 
                    className="block w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-yellow-400 transition-all text-center"
                  >
                    Register / Sign In
                  </a>
                </div>
              ) : (
                <>
                  {step === 'FORM' && (
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      <h3 className="text-base font-serif text-white">Enter Ticket Holder Information</h3>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><UserIcon size={10} /> Full Name</label>
                        <input 
                          required 
                          type="text"
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" 
                          placeholder="e.g. Rahul Sharma" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><Mail size={10} /> Email Address</label>
                        <input 
                          required 
                          type="email"
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" 
                          placeholder="e.g. rahul@example.com" 
                        />
                        <p className="text-[9px] text-zinc-500 px-1 leading-relaxed">Ensure this email is valid. Your movie viewing link will be sent here.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1 flex items-center gap-1"><Phone size={10} /> Phone Number</label>
                        <input 
                          required 
                          type="tel"
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-400 outline-none" 
                          placeholder="e.g. +91 98765 43210" 
                        />
                      </div>

                      {/* Ticket Quantity Selector */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Ticket Quantity</label>
                        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5">
                          <button 
                            type="button" 
                            disabled={quantity <= 1}
                            onClick={() => setQuantity(q => q - 1)}
                            className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-sm font-bold text-white disabled:opacity-30 hover:border hover:border-yellow-500/20 active:scale-95 transition-all"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-bold text-sm text-white">{quantity}</span>
                          <button 
                            type="button" 
                            disabled={quantity >= 10}
                            onClick={() => setQuantity(q => q + 1)}
                            className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-sm font-bold text-white disabled:opacity-30 hover:border hover:border-yellow-500/20 active:scale-95 transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex justify-between items-center text-xs font-bold text-slate-300">
                        <span>Total Due:</span>
                        <span className="text-yellow-500 text-sm">₹{59 * quantity}.00</span>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto animate-pulse">
                          <ShieldCheck size={32} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Razorpay Secure Checkout</h4>
                          <p className="text-[10px] text-zinc-400 leading-relaxed px-4">
                            Complete your pre-booking instantly using Credit/Debit Cards, Net Banking, Wallets, or UPI via Razorpay. Your ticket will be automatically verified and confirmed.
                          </p>
                        </div>
                      </div>

                      {/* Terms checkbox */}
                      <div className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
                        <input
                          type="checkbox"
                          required
                          id="accepted-booking-terms"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-1 accent-yellow-500 rounded border-zinc-800 bg-zinc-950 w-4 h-4 focus:ring-yellow-500 cursor-pointer"
                        />
                        <label htmlFor="accepted-booking-terms" className="text-[10px] text-zinc-400 leading-relaxed cursor-pointer select-none">
                          I agree to the pre-booking terms, confirm my email is correct, and understand my secure access link will be sent upon release. (Required)
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-4 bg-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <CreditCard size={14} /> Pay Securely with Razorpay
                      </button>
                    </form>
                  )}

                  {step === 'PAY_PROCESSING' && (
                    <div className="space-y-6 text-center py-6 animate-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center mx-auto animate-spin">
                        <Lock size={28} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">Secure Payment Gateway</h3>
                        <p className="text-xs text-slate-400">
                          {gatewayStatus === 'PENDING_HANDSHAKE' 
                            ? 'Initiating secure payment handshake with gateway...' 
                            : 'Waiting for server-to-server payment confirmation (webhook)...'}
                        </p>
                      </div>

                      <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-yellow-500 h-full transition-all duration-300"
                          style={{ width: `${gatewayProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 px-1">
                        <span>GATEWAY LEDGER CLEARANCE</span>
                        <span>PROGRESS: {gatewayProgress}%</span>
                      </div>

                      {/* Webhook Status Info */}
                      <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl text-left text-[10px] text-slate-400 space-y-1">
                        <p className="font-bold text-yellow-500">// BFI BACKEND SECURITY CLEARANCE:</p>
                        <p>• Verification: Waiting for server-to-server webhook confirmation...</p>
                        <p>• Signature: Checking payload integrity signature...</p>
                        <p>• Database: Validating pending ledger record status...</p>
                      </div>
                    </div>
                  )}



                  {step === 'PAY_FAILED' && (
                    <div className="space-y-6 text-center py-6 animate-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <AlertTriangle size={32} />
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-red-500 uppercase tracking-widest text-center">Payment Failed</h4>
                        <p className="text-[10px] text-slate-300 leading-relaxed text-left bg-slate-905/50 border border-slate-800 p-4 rounded-xl">
                          We could not verify your payment. Please try again.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep('FORM')}
                        className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-yellow-400 active:scale-95 transition-all"
                      >
                        Retry Payment
                      </button>
                    </div>
                  )}

                  {step === 'PAY_CANCELLED' && (
                    <div className="space-y-6 text-center py-6 animate-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center mx-auto">
                        <X size={32} />
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest text-center">Payment Cancelled</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed text-left bg-slate-905/50 border border-slate-800 p-4 rounded-xl">
                          Your payment was not completed. No ticket or GST invoice has been generated.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep('FORM')}
                        className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-yellow-400 active:scale-95 transition-all"
                      >
                        Book New Ticket
                      </button>
                    </div>
                  )}

                  {step === 'PAY_CONFIRMED' && currentBooking && (
                    <div className="space-y-6 text-center animate-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mx-auto">
                        <CheckCircle size={32} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">✅ Payment Successful</h3>
                        <p className="text-xs text-slate-400 mt-1">Your payment has been successfully verified. Your booking is now confirmed.</p>
                      </div>

                      {/* Digital Ticket Preview */}
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-black uppercase text-yellow-500 tracking-wider">BFI Official Ticket</span>
                          <span className="text-[10px] font-mono text-zinc-400 font-bold">{currentBooking.id}</span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between"><span className="text-zinc-500">Movie:</span><span className="font-bold text-white">🎬 VNS</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Booking ID:</span><span className="font-bold text-white font-mono">{currentBooking.bookingRef || currentBooking.id}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Transaction ID:</span><span className="font-bold text-white font-mono truncate max-w-[150px]">{currentBooking.txnId}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Payment Date:</span><span className="font-bold text-white">{new Date(currentBooking.date).toLocaleDateString()}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Quantity:</span><span className="font-bold text-white">{currentBooking.quantity} Ticket(s)</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Holder:</span><span className="font-bold text-white">{currentBooking.name}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Amount Paid:</span><span className="font-bold text-white">₹{currentBooking.amount.toFixed(2)}</span></div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Verification:</span>
                            <span className="font-bold text-yellow-500">Verified (Paid)</span>
                          </div>
                        </div>
                      </div>

                      {/* Automated Email Dispatch Status */}
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-left">
                        <Mail className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block">Automatic Invoice &amp; Ticket Dispatched</span>
                          <p className="text-[10px] text-slate-300 leading-normal">
                            BFI SMTP system automatically emailed your digital ticket and tax invoice to <strong className="text-white font-mono">{currentBooking.email}</strong> from <strong className="text-white font-mono">bharathfilmindustry@gmail.com</strong>.
                          </p>
                        </div>
                      </div>

                      {/* Secure Release Notification Banner */}
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-3 text-left">
                        <Lock className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider block">Official Release Access Flow</span>
                          <p className="text-[10px] text-slate-300 leading-normal">
                            When the movie is officially released, your secure unique viewing link will be sent to your registered email address (<strong className="text-white font-mono">{currentBooking.email}</strong>). No manual unlocking is required on the website.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button" 
                          onClick={() => printTicket(currentBooking)} 
                          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-yellow-500/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <Printer size={12} /> Print Ticket
                        </button>
                        <button 
                          type="button" 
                          onClick={() => printInvoice(currentBooking)} 
                          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-yellow-500/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <FileText size={12} /> GST Invoice
                        </button>
                      </div>

                      <button 
                        type="button" 
                        onClick={startNewBooking} 
                        className="w-full py-4 bg-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Book Another Ticket
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'HISTORY' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-950 border border-slate-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-serif text-white">Your Pre-Booked Tickets</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Below is the ledger of your successfully verified movie pre-bookings and digital passes.
            </p>

            {bookingHistory.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
                  <Ticket size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">No tickets found</p>
                  <p className="text-xs text-slate-500">You haven't booked any tickets in this session yet.</p>
                </div>
                {user ? (
                  <button 
                    onClick={() => setActiveSubTab('BOOKING')} 
                    className="px-6 py-2.5 bg-yellow-500 text-black font-bold text-xs uppercase tracking-wider rounded-full hover:bg-yellow-400 transition-colors"
                  >
                    Book Ticket Now
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                {bookingHistory.map((booking) => {
                  return (
                    <div key={booking.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-yellow-500/10 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded bg-yellow-500 text-black text-[9px] font-black uppercase tracking-wider">VNS Movie Pass</span>
                          <span className="font-mono text-zinc-500 text-xs">Booking ID: {booking.bookingRef || booking.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{booking.name} ({booking.email})</h4>
                        <p className="text-[10px] text-zinc-500">
                          Billed: ₹{booking.amount.toFixed(2)} for {booking.quantity} ticket(s) on {new Date(booking.date).toLocaleDateString()}
                        </p>
                        {booking.status.toUpperCase() === 'CONFIRMED' ? (
                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] text-yellow-500 font-bold">
                              🎟️ Ticket Numbers: {booking.ticketNumbers || booking.id}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                              <Lock size={12} /> Viewing link will be emailed on release
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] text-zinc-500 font-medium italic">
                              Payment status: {booking.paymentStatus || 'Pending Verification'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                              <Clock size={12} /> Awaiting manual payment verification
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {booking.status.toUpperCase() === 'CONFIRMED' ? (
                          <>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                              {booking.status}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => printTicket(booking)} 
                                title="Print Ticket"
                                className="p-2 bg-black border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-yellow-500/30 transition-all"
                              >
                                <Printer size={14} />
                              </button>
                              <button 
                                onClick={() => printInvoice(booking)} 
                                title="Download Tax Invoice"
                                className="p-2 bg-black border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-yellow-500/30 transition-all"
                              >
                                <FileText size={14} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse">
                              {booking.status}
                            </span>
                            <button
                              disabled={isClaiming}
                              onClick={() => handleClaimPayment(booking.bookingRef || '')}
                              className="px-4 py-2 bg-yellow-500 text-black font-extrabold text-[9px] uppercase tracking-wider rounded-xl hover:bg-yellow-400 disabled:opacity-50 transition-all"
                            >
                              Verify Payment
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}





    </div>
  );
};
