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

      // 8. Database Query Restrictions:
      // - Movie Lovers, Producers, Actors, Technicians, Distributors have absolutely no access to scripts/projects.
      if (
        activeRole === 'MOVIE_LOVER' ||
        activeRole === 'PRODUCER' ||
        activeRole === 'ACTOR' ||
        activeRole === 'TECHNICIAN' ||
        activeRole === 'DISTRIBUTOR'
      ) {
        callback([]);
        return;
      }

      let query = supabase.from('projects').select('*');

      // - Directors / Writers can only see their own uploaded scripts.
      if (activeRole === 'DIRECTOR' || activeRole === 'WRITER') {
        query = query.eq('directorId', session.user.id);
      } else {
        query = query.eq('status', 'ACTIVE');
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
    activeRole === 'MOVIE_LOVER' ||
    activeRole === 'PRODUCER' ||
    activeRole === 'ACTOR' ||
    activeRole === 'TECHNICIAN' ||
    activeRole === 'DISTRIBUTOR'
  ) {
    return null;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  // Confidentiality Check: Directors/Writers cannot view others' uploaded scripts
  if ((activeRole === 'DIRECTOR' || activeRole === 'WRITER') && data.directorId !== session.user.id) {
    return null;
  }

  return data as MovieProject;
};
