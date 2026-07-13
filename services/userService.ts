import { supabase } from "./firebase";
import { User, UserRole } from "../types";

export const syncUserToFirestore = async (supabaseUser: any, role?: UserRole, name?: string): Promise<User> => {
  // Check if profile exists
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  if (profile) {
    // Force ADMIN role for this email if not already set
    if (supabaseUser.email === 'bharatfilmindustry@gmail.com' && profile.role !== UserRole.ADMIN) {
      await supabase.from('profiles').update({ role: UserRole.ADMIN, primary_role: UserRole.ADMIN, active_role: UserRole.ADMIN }).eq('id', supabaseUser.id);
      profile.role = UserRole.ADMIN;
      profile.primary_role = UserRole.ADMIN;
      profile.active_role = UserRole.ADMIN;
    }
    
    // Auto-migrate primary_role if it is missing or is set to MOVIE_LOVER but auth metadata has their actual role
    let resolvedPrimary = profile.primary_role;
    if (!resolvedPrimary || resolvedPrimary === UserRole.MOVIE_LOVER) {
      const metaRole = supabaseUser.user_metadata?.role;
      if (metaRole && metaRole !== UserRole.MOVIE_LOVER) {
        resolvedPrimary = metaRole;
        await supabase.from('profiles').update({ primary_role: metaRole }).eq('id', supabaseUser.id);
        profile.primary_role = metaRole;
      }
    }
    
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      primaryRole: profile.primary_role || profile.role,
      activeRole: profile.active_role || profile.role,
      movieLoverActivated: profile.movie_lover_activated || false,
      kycStatus: profile.kycStatus,
      totalInvested: profile.totalInvested || 0,
      projects: profile.projects || [],
      photoURL: profile.photoURL,
      photoFileName: profile.photoFileName
    } as User;
  }

  // Metadata from Supabase Auth options or inputs
  const finalName = name || supabaseUser.user_metadata?.full_name || "BFI Member";
  let finalRole = role || supabaseUser.user_metadata?.role || UserRole.INVESTOR;

  if (supabaseUser.email === 'bharatfilmindustry@gmail.com') {
    finalRole = UserRole.ADMIN;
  }

  const newUserDb = {
    id: supabaseUser.id,
    name: finalName,
    email: supabaseUser.email || "",
    role: finalRole,
    primary_role: finalRole,
    active_role: finalRole,
    movie_lover_activated: finalRole === UserRole.MOVIE_LOVER,
    kycStatus: 'VERIFIED',
    totalInvested: 0,
    projects: [],
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalName}`
  };

  const { error: insertError } = await supabase
    .from('profiles')
    .insert([newUserDb]);

  if (insertError) {
    console.error("Profile sync insert error:", insertError);
  }

  return {
    id: supabaseUser.id,
    name: finalName,
    email: supabaseUser.email || "",
    role: finalRole,
    primaryRole: finalRole,
    activeRole: finalRole,
    movieLoverActivated: finalRole === UserRole.MOVIE_LOVER,
    kycStatus: 'VERIFIED',
    totalInvested: 0,
    projects: [],
    photoURL: newUserDb.photoURL
  } as User;
};

export const updateUserInFirestore = async (uid: string, data: Partial<User>) => {
  const dbData: any = {};
  if (data.name !== undefined) dbData.name = data.name;
  if (data.role !== undefined) dbData.role = data.role;
  if (data.primaryRole !== undefined) dbData.primary_role = data.primaryRole;
  if (data.activeRole !== undefined) dbData.active_role = data.activeRole;
  if (data.movieLoverActivated !== undefined) dbData.movie_lover_activated = data.movieLoverActivated;
  if (data.kycStatus !== undefined) dbData.kycStatus = data.kycStatus;
  if (data.photoURL !== undefined) dbData.photoURL = data.photoURL;
  if (data.photoFileName !== undefined) dbData.photoFileName = data.photoFileName;

  await supabase
    .from('profiles')
    .update(dbData)
    .eq('id', uid);
};

export const deleteUserAccount = async (uid: string) => {
  await supabase.from('profiles').delete().eq('id', uid);
  await supabase.auth.signOut();
};
