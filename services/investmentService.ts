
import { supabase } from "./firebase";
import { Investment } from "../types";

export const recordInvestment = async (uid: string, investment: Omit<Investment, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('investments')
    .insert([{ ...investment, userId: uid }])
    .select()
    .single();

  if (error) throw error;

  // Only update project counters immediately if the investment is auto-verified (e.g. Razorpay)
  if (investment.status === 'VERIFIED') {
    const { data: project } = await supabase.from('projects').select('current_funding, investor_count').eq('id', investment.projectId).single();
    if (project) {
      await supabase.from('projects').update({
        current_funding: project.current_funding + investment.amount,
        investor_count: project.investor_count + 1
      }).eq('id', investment.projectId);
    }
  }

  return data.id;
};

export const getUserInvestments = async (uid: string): Promise<Investment[]> => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('userId', uid)
    .order('date', { ascending: false });

  if (error) return [];
  return data as Investment[];
};
