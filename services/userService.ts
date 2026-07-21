import { supabase } from "./firebase";
import { User, UserRole } from "../types";

/**
 * Synchronise a Supabase auth user with the "profiles" table.
 * Returns a fully populated {@link User} object.
 */
export const syncUserToFirestore = async (supabaseUser: any, role?: UserRole, name?: string, phone?: string): Promise<User> => {
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
    const userEmail = (supabaseUser.email || "").toLowerCase();
    const isAdminEmail = userEmail === 'bharathfilmindustry@gmail.com';

    if (isAdminEmail) {
      if (profile.role !== UserRole.ADMIN || profile.primary_role !== UserRole.ADMIN || profile.active_role !== UserRole.ADMIN) {
        try {
          console.log("SYNC_USER: Overriding role to ADMIN in database for primary administrator...");
          const { error: updErr } = await supabase.from('profiles').update({ role: UserRole.ADMIN, primary_role: UserRole.ADMIN, active_role: UserRole.ADMIN }).eq('id', supabaseUser.id);
          if (updErr) console.error("SYNC_USER: Failed to update role to ADMIN:", updErr);
        } catch (e) {
          console.error("SYNC_USER: Update admin role exception:", e);
        }
        profile.role = UserRole.ADMIN;
        profile.primary_role = UserRole.ADMIN;
        profile.active_role = UserRole.ADMIN;
      }
    } else {
      // Ensure non‑admin users never retain ADMIN role.
      let changed = false;
      let resolvedPrimary = profile.primary_role;
      let resolvedActive = profile.active_role;
      let resolvedRole = profile.role;

      if (resolvedPrimary === UserRole.ADMIN || !resolvedPrimary || resolvedPrimary === UserRole.MOVIE_LOVER) {
        resolvedPrimary = supabaseUser.user_metadata?.role || UserRole.INVESTOR;
        if (resolvedPrimary === UserRole.ADMIN || resolvedPrimary === UserRole.MOVIE_LOVER) {
          resolvedPrimary = UserRole.INVESTOR; // hard fallback
        }
        changed = true;
      }
      if (resolvedActive === UserRole.ADMIN) {
        resolvedActive = resolvedPrimary;
        changed = true;
      }
      if (resolvedRole === UserRole.ADMIN) {
        resolvedRole = resolvedActive;
        changed = true;
      }

      if (changed) {
        try {
          console.log("SYNC_USER: Demoting non‑admin user back to standard role:", resolvedPrimary);
          const { error: updErr } = await supabase.from('profiles').update({
            role: resolvedRole,
            primary_role: resolvedPrimary,
            active_role: resolvedActive
          }).eq('id', supabaseUser.id);
          if (updErr) console.error("SYNC_USER: Failed to demote user:", updErr);
        } catch (e) {
          console.error("SYNC_USER: Demote user role exception:", e);
        }
        profile.role = resolvedRole;
        profile.primary_role = resolvedPrimary;
        profile.active_role = resolvedActive;
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
      photoFileName: profile.photoFileName,
      phone: profile.phone
    } as User;
  }

  // No existing profile – create a new one.
  console.log("SYNC_USER: Profile not found. Preparing new profile registration...");
  const finalName = name || supabaseUser.user_metadata?.full_name || "BFI Member";
  let finalRole = role || supabaseUser.user_metadata?.role || UserRole.INVESTOR;

  if (finalRole === UserRole.MOVIE_LOVER) {
    finalRole = UserRole.INVESTOR;
  }

  const userEmail = (supabaseUser.email || "").toLowerCase();
  const isAdminEmail = userEmail === 'bharathfilmindustry@gmail.com';

  if (isAdminEmail) {
    finalRole = UserRole.ADMIN;
  } else if (finalRole === UserRole.ADMIN) {
    finalRole = UserRole.INVESTOR; // fallback for non‑admin email
  }

  const newUserDb = {
    id: supabaseUser.id,
    name: finalName,
    email: supabaseUser.email || "",
    phone: phone || supabaseUser.user_metadata?.phone || null,
    role: finalRole,
    primary_role: finalRole,
    active_role: finalRole,
    movie_lover_activated: finalRole === UserRole.MOVIE_LOVER,
    kycStatus: finalRole === UserRole.ADMIN ? 'VERIFIED' : 'PENDING',
    totalInvested: 0,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalName}`
  };

  try {
    console.log("SYNC_USER: Inserting new profile record into database...", newUserDb);
    const { error: insertError } = await supabase.from('profiles').insert([newUserDb]);
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
    photoURL: newUserDb.photoURL,
    phone: newUserDb.phone
  } as User;
};

/** Update a user profile in the "profiles" table. */
export const updateUserInFirestore = async (uid: string, data: Partial<User>) => {
  const dbData: any = {};
  if (data.name !== undefined) dbData.name = data.name;
  if (data.phone !== undefined) dbData.phone = data.phone;
  if (data.role !== undefined) dbData.role = data.role;
  if (data.primaryRole !== undefined) dbData.primary_role = data.primaryRole;
  if (data.activeRole !== undefined) dbData.active_role = data.activeRole;
  if (data.movieLoverActivated !== undefined) dbData.movie_lover_activated = data.movieLoverActivated;
  if (data.kycStatus !== undefined) dbData.kycStatus = data.kycStatus;
  if (data.photoURL !== undefined) dbData.photoURL = data.photoURL;
  if (data.photoFileName !== undefined) dbData.photoFileName = data.photoFileName;

  await supabase.from('profiles').update(dbData).eq('id', uid);
};

/** Delete a user profile and sign out. */
export const deleteUserAccount = async (uid: string) => {
  await supabase.from('profiles').delete().eq('id', uid);
  await supabase.auth.signOut();
};

/** Helper to check if a user has admin privileges. */
export const isAdmin = (user: User): boolean => {
  return user.role === UserRole.ADMIN;
};
