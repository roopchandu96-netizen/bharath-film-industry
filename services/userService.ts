import { supabase } from "./firebase";
import { User, UserRole } from "../types";

export const syncUserToFirestore = async (supabaseUser: any, role?: UserRole, name?: string): Promise<User> => {
  console.log("SYNC_USER: starting sync for ID:", supabaseUser?.id, "Email:", supabaseUser?.email);
  
  let profile: any = null;
  try {
    console.log("SYNC_USER: executing select profiles query...");
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .limit(1);
    
    if (error) {
      console.warn("SYNC_USER: Select query returned error:", error);
    } else if (data && data.length > 0) {
      profile = data[0];
    }
  } catch (err) {
    console.error("SYNC_USER: Select query exception thrown:", err);
  }

  if (profile) {
    console.log("SYNC_USER: Profile found in database:", profile);
    // Force ADMIN role for developer/admin emails if not already set
    const ADMIN_EMAILS = [
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    ];
    const userEmail = (supabaseUser.email || "").toLowerCase();
    if (userEmail && ADMIN_EMAILS.includes(userEmail) && profile.role !== UserRole.ADMIN) {
      try {
        console.log("SYNC_USER: Overriding role to ADMIN in database...");
        const { error: updErr } = await supabase.from('profiles').update({ role: UserRole.ADMIN, primary_role: UserRole.ADMIN, active_role: UserRole.ADMIN }).eq('id', supabaseUser.id);
        if (updErr) console.error("SYNC_USER: Failed to update role to ADMIN:", updErr);
      } catch (e) {
        console.error("SYNC_USER: Update admin role exception:", e);
      }
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
        try {
          const { error: updErr } = await supabase.from('profiles').update({ primary_role: metaRole }).eq('id', supabaseUser.id);
          if (updErr) console.error("SYNC_USER: Failed to update primary_role:", updErr);
        } catch (e) {
          console.error("SYNC_USER: Update primary_role exception:", e);
        }
        profile.primary_role = metaRole;
      }
    }
    
    // Completely migrate and eradicate MOVIE_LOVER role from database for all users
    if (profile.role === 'MOVIE_LOVER' || profile.active_role === 'MOVIE_LOVER' || profile.primary_role === 'MOVIE_LOVER') {
      const targetRole = UserRole.INVESTOR;
      try {
        const { error: updErr } = await supabase.from('profiles').update({ role: targetRole, active_role: targetRole, primary_role: targetRole }).eq('id', supabaseUser.id);
        if (updErr) console.error("SYNC_USER: Failed to migrate MOVIE_LOVER role:", updErr);
      } catch (e) {
        console.error("SYNC_USER: Migrate MOVIE_LOVER exception:", e);
      }
      profile.role = targetRole;
      profile.active_role = targetRole;
      profile.primary_role = targetRole;
    }
    
    // Enforce actual registered role: Reset active_role and role back to primary_role if they switch-toggled earlier.
    if (profile.primary_role && profile.primary_role !== UserRole.MOVIE_LOVER && (profile.active_role === UserRole.MOVIE_LOVER || profile.role === UserRole.MOVIE_LOVER)) {
      try {
        const { error: updErr } = await supabase.from('profiles').update({ role: profile.primary_role, active_role: profile.primary_role }).eq('id', supabaseUser.id);
        if (updErr) console.error("SYNC_USER: Failed to reset active_role:", updErr);
      } catch (e) {
        console.error("SYNC_USER: Reset active_role exception:", e);
      }
      profile.role = profile.primary_role;
      profile.active_role = profile.primary_role;
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
  console.log("SYNC_USER: Profile not found. Preparing new profile registration...");
  const finalName = name || supabaseUser.user_metadata?.full_name || "BFI Member";
  let finalRole = role || supabaseUser.user_metadata?.role || UserRole.INVESTOR;

  if (finalRole === UserRole.MOVIE_LOVER) {
    finalRole = UserRole.INVESTOR;
  }

  const ADMIN_EMAILS = [
    'bharathfilmindustry@gmail.com',
    'shubhamghodageri@gmail.com',
    'thechittoortimes@gmail.com',
    'chanduchowdary324@gmail.com',
    'prathapaneniroopchandu@gmail.com',
    'siriprathapaneni@gmail.com',
    'roopchandu96@gmail.com'
  ];
    const userEmail = (supabaseUser.email || "").toLowerCase();
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
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
    kycStatus: finalRole === UserRole.ADMIN ? 'VERIFIED' : 'PENDING',
    totalInvested: 0,
    projects: [],
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalName}`
  };

  try {
    console.log("SYNC_USER: Inserting new profile record into database...", newUserDb);
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([newUserDb]);

    if (insertError) {
      console.error("SYNC_USER: Profile sync insert error:", insertError);
    }
  } catch (err) {
    console.error("SYNC_USER: Profile sync insert exception:", err);
  }

  return {
    id: supabaseUser.id,
    name: finalName,
    email: supabaseUser.email || "",
    role: finalRole,
    primaryRole: finalRole,
    activeRole: finalRole,
    movieLoverActivated: finalRole === UserRole.MOVIE_LOVER,
    kycStatus: finalRole === UserRole.ADMIN ? 'VERIFIED' : 'PENDING',
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
