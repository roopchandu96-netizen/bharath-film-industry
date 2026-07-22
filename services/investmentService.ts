
import { supabase } from "./firebase";
import { Investment, MovieProject } from "../types";
import { agreementService } from "./agreementService";

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

  try {
    await agreementService.createAgreement('investor', uid, investment.projectId);
  } catch (err) {
    console.error("Failed to create investor agreement:", err);
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

export const getUserInvestmentsWithProjects = async (uid: string): Promise<(Investment & { project?: MovieProject })[]> => {
  const { data, error } = await supabase
    .from('investments')
    .select('*, project:projects(id, title, genre, budget, fundingGoal, currentFunding, investorCount, director, status)')
    .eq('userId', uid)
    .order('date', { ascending: false });

  if (error) {
    console.error("getUserInvestmentsWithProjects failed:", error);
    return [];
  }
  return data as any[];
};
