import { supabase } from "./firebase";
import { MovieProject } from "../types";

/**
 * Subscribe to active projects from Supabase based on the user's active role.
 */
export const subscribeToActiveProjects = (
  callback: (projects: MovieProject[]) => void,
  errorCallback?: (error: any) => void
) => {
  const fetchAndCallback = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        callback([]);
        return;
      }

      // 7. Backend & database active role verification
      const activeRole = localStorage.getItem(`bfi_active_role_${session.user.id}`) || session.user.user_metadata?.role || 'MOVIE_LOVER';

      // 8. Database Query Restrictions: Only Investors, Directors, and Admins can access projects/scripts.
      if (
        activeRole !== 'INVESTOR' &&
        activeRole !== 'DIRECTOR' &&
        activeRole !== 'ADMIN'
      ) {
        callback([]);
        return;
      }

      let query = supabase.from('projects').select('*');

      // - Directors can only see their own uploaded scripts.
      // - Investors can only see approved (ACTIVE) scripts available for investment.
      if (activeRole === 'DIRECTOR') {
        query = query.eq('directorId', session.user.id);
      } else if (activeRole === 'INVESTOR') {
        query = query.ilike('status', 'ACTIVE');
      }

      const { data, error } = await query;
      if (error) {
        if (errorCallback) errorCallback(error);
      } else {
        callback(data as MovieProject[]);
      }
    } catch (err) {
      if (errorCallback) errorCallback(err);
    }
  };

  fetchAndCallback();

  // Realtime subscription
  const channel = supabase
    .channel('active_projects')
    .on('postgres_changes', { event: '*', table: 'projects', schema: 'public' }, () => {
      fetchAndCallback();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const createProject = async (projectData: Omit<MovieProject, 'id' | 'directorId'>): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const newProject = {
    ...projectData,
    directorId: session.user.id,
    currentFunding: 0,
    investorCount: 0,
    status: 'PENDING',
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([newProject])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getProjectById = async (id: string): Promise<MovieProject | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const activeRole = localStorage.getItem(`bfi_active_role_${session.user.id}`) || session.user.user_metadata?.role || 'MOVIE_LOVER';

  if (
    activeRole !== 'INVESTOR' &&
    activeRole !== 'DIRECTOR' &&
    activeRole !== 'ADMIN'
  ) {
    return null;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  // Confidentiality Check: Directors can ONLY view their own uploaded scripts. Investors can only view ACTIVE ones.
  if (activeRole === 'DIRECTOR' && data.directorId !== session.user.id) {
    return null;
  }
  if (activeRole === 'INVESTOR' && data.status !== 'ACTIVE') {
    return null;
  }

  return data as MovieProject;
};
