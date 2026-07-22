import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';
import { supabase } from '../supabase';
import { Agreement, User, MovieProject } from '../types';

export const pdfService = {
  async generateAgreementPDF(
    agreement: Agreement,
    user: User,
    project: MovieProject,
    signatureDetails: any,
    amount?: number
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Theme colors (Luxury Black & Gold)
    const primaryColor = '#1A1A1A';
    const accentColor = '#D4AF37'; // Gold
    const textColor = '#333333';

    // --- Helper to draw header ---
    const drawHeader = () => {
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(accentColor);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('BharatFilmIndustry™', 14, 16);
      
      doc.setTextColor('#FFFFFF');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Electronic Legal Agreement', pageWidth - 60, 15);
    };

    // --- Helper to draw footer ---
    const drawFooter = (pageNumber: number) => {
      doc.setFillColor(primaryColor);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      
      doc.setTextColor(accentColor);
      doc.setFontSize(8);
      doc.text('Electronically Executed Agreement | BharatFilmIndustry™', 14, pageHeight - 6);
      doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 6);
    };

    // Initialize Page 1
    drawHeader();
    let yPos = 35;

    // Agreement Details
    doc.setTextColor(textColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(agreement.type === 'investor' ? 'INVESTOR AGREEMENT' : 'FILMMAKER AGREEMENT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Agreement Number: ${agreement.agreement_number}`, 14, yPos);
    doc.text(`Date: ${new Date(agreement.created_at).toLocaleDateString('en-IN')}`, pageWidth - 60, yPos);
    yPos += 15;

    // Parties
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTIES', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('This Agreement is entered into between:', 14, yPos);
    yPos += 8;

    // Party 1
    doc.setFont('helvetica', 'bold');
    doc.text('Party 1 (The Company):', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;
    doc.text('BharatFilmIndustry™', 20, yPos);
    yPos += 5;
    doc.text('Proprietor: Prathapaneni Roopchandu', 20, yPos);
    yPos += 10;

    // Party 2
    doc.setFont('helvetica', 'bold');
    doc.text('Party 2 (The User):', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;
    doc.text(`Name: ${user.name}`, 20, yPos);
    yPos += 5;
    doc.text(`Email: ${user.email}`, 20, yPos);
    if (user.phone) {
      yPos += 5;
      doc.text(`Phone: ${user.phone}`, 20, yPos);
    }
    yPos += 15;

    // Project Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT DETAILS', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Project Title: ${project.title}`, 20, yPos);
    yPos += 5;
    if (amount) {
      doc.text(`Investment Amount: ₹${amount.toLocaleString('en-IN')}`, 20, yPos);
      yPos += 5;
    }
    yPos += 10;

    // Terms & Conditions (simplified for illustration, would be large block in reality)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const termsText = `1. The User agrees to abide by all Indian laws, including the Information Technology Act, 2000.
2. The Company makes no guarantee of financial returns. Investments carry inherent risks.
3. This agreement is electronically signed and constitutes a legally binding contract.
4. Confidentiality and Data Privacy will be maintained as per the Company's privacy policy.
5. In case of dispute, jurisdiction shall fall within the designated courts in India.`;

    const splitTerms = doc.splitTextToSize(termsText, pageWidth - 28);
    doc.text(splitTerms, 14, yPos);
    yPos += splitTerms.length * 5 + 15;

    drawFooter(1);
    doc.addPage();
    drawHeader();
    yPos = 35;

    // E-Signature Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor);
    doc.text('ELECTRONIC SIGNATURE & AUDIT TRAIL', 14, yPos);
    yPos += 15;

    doc.setTextColor(textColor);
    doc.setFontSize(10);
    
    // Add Signature Details Table
    (doc as any).autoTable({
      startY: yPos,
      head: [['Attribute', 'Detail']],
      body: [
        ['Agreement Status', 'Electronically Signed & Verified via OTP'],
        ['Signer Name', user.name],
        ['Signer Email', user.email],
        ['IP Address', signatureDetails.ip_address || 'N/A'],
        ['Device / Browser', signatureDetails.browser_info || 'N/A'],
        ['Timestamp (IST)', new Date(signatureDetails.signed_at).toLocaleString('en-IN')],
        ['Digital Hash (SHA-256)', signatureDetails.hash_id || 'N/A']
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: accentColor },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Generate QR Code
    const verificationUrl = `https://bharath-film-industry.com/verify-agreement/${agreement.id}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H' });
    
    doc.addImage(qrDataUrl, 'PNG', 14, yPos, 40, 40);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Scan QR Code to verify authenticity', 14, yPos + 45);
    
    // Official Stamp placeholder
    doc.setDrawColor(accentColor);
    doc.setLineWidth(1);
    doc.rect(pageWidth - 60, yPos, 45, 45);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor);
    doc.text('BFI', pageWidth - 45, yPos + 20);
    doc.text('VERIFIED', pageWidth - 50, yPos + 30);

    drawFooter(2);

    return doc.output('blob');
  },

  async uploadAgreementToStorage(blob: Blob, agreementNumber: string, userId: string): Promise<string> {
    const fileName = `${userId}/${agreementNumber}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('agreements')
      .upload(fileName, blob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('agreements')
      .getPublicUrl(fileName);
      
    // Because the bucket is private, we should actually generate a signed URL when they want to download.
    // Or we store the relative path and fetch it dynamically.
    // For now, returning the path.
    return data.path;
  },

  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('agreements')
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) throw error;
    return data.signedUrl;
  }
};
