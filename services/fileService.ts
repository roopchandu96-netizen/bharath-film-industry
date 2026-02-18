
import { supabase } from "./firebase.ts";
import { FileRecord, Investment, MovieProject, SmartAgreement } from "../types.ts";
import { GoogleGenAI } from "@google/genai";

/**
 * BFI Vault: Document Archiving Logic
 */
export const uploadFileWithSync = async (uid: string, file: File): Promise<FileRecord> => {
  const fileId = `${Date.now()}-${file.name}`;
  const storagePath = `${uid}/${fileId}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('user_uploads')
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('user_uploads')
    .getPublicUrl(storagePath);

  // 2. Generate AI Summary using Gemini
  let aiSummary = "Analyzing document structure...";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a deep BFI ledger analysis for a file named "${file.name}" of type ${file.type}. Provide a professional one-sentence summary for a film producer's vault.`
    });
    aiSummary = response.text || "Standard Production Document.";
  } catch (e) {
    console.error("AI Summary error:", e);
    aiSummary = `Vault entry: ${file.name} (Archive size: ${(file.size / 1024).toFixed(1)} KB)`;
  }

  // 3. Create Record in Supabase DB
  const fileRecord: FileRecord = {
    id: fileId,
    name: file.name,
    type: file.type,
    size: file.size,
    url: publicUrl,
    path: storagePath,
    uploadDate: new Date().toISOString(),
    notes: `BFI Ledger Entry - ${file.type} archived by user.`,
    aiSummary,
    actionType: 'UPLOAD'
  };

  const { error: dbError } = await supabase
    .from('file_records')
    .insert([{ ...fileRecord, user_id: uid }]);

  if (dbError) console.error("Database sync error:", dbError);

  return fileRecord;
};

/**
 * BFI Intelligence: Draft Smart Agreement from Document
 */
export const generateAgreementFromDoc = async (uid: string, file: File): Promise<{ record: FileRecord, agreement: SmartAgreement }> => {
  // 1. Upload the base document
  const record = await uploadFileWithSync(uid, file);

  // 2. Use Gemini to draft an agreement based on it
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the uploaded production document "${file.name}", draft a formal BFI Smart Agreement for the Bharath Film Industry platform. 
    Ensure institutional language, Pan-India jurisdiction, and SEBI compliance is included in the clauses.`
  });

  const agreement: SmartAgreement = {
    id: `AGREE-${Date.now()}`,
    content: response.text || "Agreement content pending analysis.",
    status: 'DRAFT'
  };

  return { record, agreement };
};

/**
 * Generates a smart agreement for a specific investment record and triggers download.
 */
export const downloadInvestmentAgreement = async (investment: Investment, project: MovieProject): Promise<void> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Draft a formal BFI Investment Agreement for:
    Investor Name: BFI Member
    Project Title: ${project.title}
    Investment Amount: ₹${investment.amount}
    Producer Tier: ${investment.tier}
    Execution Date: ${new Date(investment.date).toLocaleDateString()}
    Transaction ID: BFI-TXN-${investment.id}
    
    Format with professional legal headings for the Bharath Film Industry.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    const content = response.text || "Failed to generate agreement.";
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `BFI_Agreement_${project.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Investment Agreement Error:", error);
    alert("Unable to generate Smart Agreement.");
  }
};

export const getFileHistory = async (uid: string): Promise<FileRecord[]> => {
  const { data, error } = await supabase
    .from('file_records')
    .select('*')
    .eq('user_id', uid)
    .order('uploadDate', { ascending: false });

  if (error) {
    console.error("Fetch history error:", error);
    return [];
  }
  
  return data as FileRecord[];
};
