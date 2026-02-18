
import { supabase } from "./firebase";

// Mock email sending function
// In a real production app, this would call an Edge Function or API (e.g., SendGrid/AWS SES)
export const sendEmailNotification = async (subject: string, body: string) => {
    console.log(`[MOCK EMAIL SERVICE] Sending email to: bharathfilmindustry@gmail.com`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // We can also log this notification to a 'notifications' table in Supabase if it exists
    // for the admin to see in their dashboard.
    try {
        const { error } = await supabase.from('notifications').insert([{
            type: 'EMAIL_ALERT',
            recipient: 'bharathfilmindustry@gmail.com',
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
