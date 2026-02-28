
import { supabase } from "./firebase";
import { MovieProject } from "../types";

/**
 * Subscribe to active projects from Supabase.
 */
export const subscribeToActiveProjects = (
  callback: (projects: MovieProject[]) => void,
  errorCallback?: (error: any) => void
) => {
  // Initial Fetch
  supabase
    .from('projects')
    .select('*')
    .eq('status', 'ACTIVE')
    .then(({ data, error }) => {
      if (error) {
        if (errorCallback) errorCallback(error);
      } else {
        callback(data as MovieProject[]);
      }
    });

  // Realtime subscription
  const channel = supabase
    .channel('active_projects')
    .on('postgres_changes', { event: '*', table: 'projects', schema: 'public' }, () => {
      supabase.from('projects').select('*').eq('status', 'ACTIVE').then(({ data }) => {
        if (data) callback(data as MovieProject[]);
      });
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
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as MovieProject;
};
