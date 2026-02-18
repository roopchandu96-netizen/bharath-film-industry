
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./firebase.ts";

const SYSTEM_INSTRUCTION = `
You are 'BFI Intellect', the official AI Investment Advisor for the Bharath Film Industry (BFI) platform.
Your objective is to provide elite financial guidance, project analysis, and platform support.

BFI Ecosystem Context:
- BFI is a regulatory-compliant film investment bridge for Pan-India cinema.
- Investment Vehicles: Individual Stakes, Syndicates (Lounge), and Smart Agreements (Studio).
- Tiers: Supporter, Associate, Co-Producer, Executive Producer.

Role Guidelines:
- Tone: Sophisticated, institutional, and professional.
- Finance: Discuss ROI potential, Escrow protocols, and Equity Ledgering based on general industry standards.
- Guidance: Direct users to the 'Lounge' for community networking or the 'Studio' for KYC, document archiving, and contract drafting.
- Disclaimer: You are an AI advisor; always mention that final decisions should be reviewed by professional legal and financial counsel.

User Context: The user interacts with real, self-generated or industry-listed productions.
`;

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  createTime: any;
}

export class BFIChatService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Fixed: Create a new instance right before making an API call
  private getAI() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || (window as any).process?.env?.API_KEY || '';
    if (!apiKey) console.warn("BFI Intellect: Missing VITE_GOOGLE_API_KEY");
    return new GoogleGenAI({ apiKey }); // GoogleGenAI constructor might behave differently depending on version if key is missing
  }

  async getChatHistory(callback: (messages: any[]) => void) {
    // Initial fetch
    const { data, error } = await supabase
      .from('ai_history')
      .select('*')
      .eq('user_id', this.userId)
      .order('createTime', { ascending: true });

    if (!error && data) {
      callback(data);
    }

    // Real-time subscription
    const channel = supabase
      .channel(`ai_history_${this.userId}`)
      .on('postgres_changes', {
        event: '*',
        table: 'ai_history',
        schema: 'public',
        filter: `user_id=eq.${this.userId}`
      }, async () => {
        const { data: updatedData } = await supabase
          .from('ai_history')
          .select('*')
          .eq('user_id', this.userId)
          .order('createTime', { ascending: true });
        if (updatedData) callback(updatedData);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async clearHistory() {
    await supabase
      .from('ai_history')
      .delete()
      .eq('user_id', this.userId);
  }

  async sendMessage(message: string) {
    const timestamp = new Date().toISOString();

    await supabase.from('ai_history').insert([{
      user_id: this.userId,
      role: 'user',
      content: message,
      createTime: timestamp
    }]);

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
        },
      });

      const aiText = response.text || "BFI Intellect is momentarily recalibrating. Please retry.";

      await supabase.from('ai_history').insert([{
        user_id: this.userId,
        role: 'model',
        content: aiText,
        createTime: new Date().toISOString()
      }]);

      return aiText;
    } catch (error) {
      console.error("BFI Intellect Error:", error);
      const errorText = "The BFI secure channel is experiencing high traffic. Please try again.";
      await supabase.from('ai_history').insert([{
        user_id: this.userId,
        role: 'model',
        content: errorText,
        createTime: new Date().toISOString()
      }]);
      return errorText;
    }
  }
}
