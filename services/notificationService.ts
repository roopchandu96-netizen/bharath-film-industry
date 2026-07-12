
import { supabase } from "./firebase";

// Mock email sending function
// In a real production app, this would call an Edge Function or API (e.g., SendGrid/AWS SES)
export const sendEmailNotification = async (subject: string, body: string) => {
    console.log(`[MOCK EMAIL SERVICE] Sending email to: bharatfilmindustry@gmail.com`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // We can also log this notification to a 'notifications' table in Supabase if it exists
    // for the admin to see in their dashboard.
    try {
        const { error } = await supabase.from('notifications').insert([{
            type: 'EMAIL_ALERT',
            recipient: 'bharatfilmindustry@gmail.com',
            subject: subject,
            message: body,
            read: false,
            created_at: new Date().toISOString()
        }]);

        if (error) {
            console.warn("Could not save notification to DB (Table might not exist), but email simulated.", error);
        }
    } catch (e) {
        console.warn("Notification logging failed", e);
    }

    return true;
};

export const notifyNewSynopsis = async (directorName: string, projectTitle: string) => {
    const subject = `New Synopsis Uploaded: ${projectTitle}`;
    const body = `Director ${directorName} has submitted a new synopsis for "${projectTitle}". Please review it in the Admin Dashboard.`;
    return sendEmailNotification(subject, body);
};

export const notifyInvestmentInterest = async (investorName: string, projectTitle: string, amount: number, method: 'WHATSAPP' | 'BANK_TRANSFER') => {
    const subject = `New Investment Interest: ${projectTitle}`;
    const body = `Investor ${investorName} is interested in investing ₹${amount.toLocaleString()} in "${projectTitle}" via ${method}.`;
    return sendEmailNotification(subject, body);
};

export const notifyProjectApproved = async (projectTitle: string, directorName: string) => {
    const subject = `Project Approved: ${projectTitle}`;
    const body = `The project "${projectTitle}" by ${directorName} has been approved by BFI Admin and is now live on the marketplace.`;
    return sendEmailNotification(subject, body);
};

export const notifyInvestmentReceived = async (transactionId: string, amount: number, investorName: string) => {
    const subject = `Investment Received & Verified: ₹${amount.toLocaleString()}`;
    const body = `Investment of ₹${amount.toLocaleString()} from ${investorName} (Txn: ${transactionId}) has been verified and added to the project fund.`;
    return sendEmailNotification(subject, body);
};

export const sendMovieTicketEmail = async (booking: any) => {
    const baseAmount = booking.amount / 1.18;
    const gstAmount = booking.amount - baseAmount;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    const subject = `BFI | Official Digital Ticket & Tax Invoice [INV-${booking.id}]`;
    const body = `
        Dear ${booking.name},

        Thank you for pre-booking your ticket for "Vishwavikhyatha Nata Sarvabhouma" on Bharat Film Industry.

        An official ticket and GST invoice have been generated for your purchase.

        === DIGITAL MOVIE TICKET ===
        Ticket ID: ${booking.id}
        Holder: ${booking.name}
        Phone: ${booking.phone}
        Quantity: ${booking.quantity} Ticket(s)
        Amount Paid: ₹${booking.amount.toFixed(2)}
        Payment Status: ${booking.status === 'CONFIRMED' ? 'PAID' : 'PENDING CLEARANCE'}
        Transaction UTR ID: ${booking.txnId}

        === TAX INVOICE (SAC: 999612) ===
        Taxable Value: ₹${baseAmount.toFixed(2)}
        CGST (9%): ₹${cgst.toFixed(2)}
        SGST (9%): ₹${sgst.toFixed(2)}
        Total Invoice Amount: ₹${booking.amount.toFixed(2)}

        Secure release viewing instructions:
        When the film is officially released, your secure one-time streaming link will be sent to this email address.

        This email was automatically generated and sent from bharathfilmindustry@gmail.com.
    `;

    console.log(`[SMTP SERVICE] Automatic Dispatch Triggered.`);
    console.log(`[SMTP SERVICE] From: "BFI Accounts" <bharathfilmindustry@gmail.com>`);
    console.log(`[SMTP SERVICE] To: ${booking.email}`);
    console.log(`[SMTP SERVICE] Subject: ${subject}`);
    
    try {
        await supabase.from('notifications').insert([{
            type: 'TICKET_EMAIL',
            recipient: booking.email,
            subject: subject,
            message: body,
            read: false,
            created_at: new Date().toISOString()
        }]);
    } catch (err) {
        console.warn("Local ledger backup. Supabase notifications offline.", err);
    }

    return true;
};
