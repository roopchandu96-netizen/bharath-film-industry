
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
    if (supabaseUser.email === 'bharathfilmindustry@gmail.com' && profile.role !== UserRole.ADMIN) {
      await supabase.from('profiles').update({ role: UserRole.ADMIN }).eq('id', supabaseUser.id);
      profile.role = UserRole.ADMIN;
    }
    return profile as User;
  }

  // Metadata from Supabase Auth options or inputs
  const finalName = name || supabaseUser.user_metadata?.full_name || "BFI Member";
  let finalRole = role || supabaseUser.user_metadata?.role || UserRole.INVESTOR;

  if (supabaseUser.email === 'bharathfilmindustry@gmail.com') {
    finalRole = UserRole.ADMIN;
  }

  const newUser: User = {
    id: supabaseUser.id,
    name: finalName,
    email: supabaseUser.email || "",
    role: finalRole,
    kycStatus: 'VERIFIED',
    totalInvested: 0,
    projects: [],
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalName}`
  };

  const { error: insertError } = await supabase
    .from('profiles')
    .insert([newUser]);

  if (insertError) {
    console.error("Profile sync insert error:", insertError);
    // Fallback: If insert error is actually "duplicate", just return newUser as it likely succeeded in parallel
  } else {
    console.log("Profile created:", newUser.id);
  }
  return newUser;
};

export const updateUserInFirestore = async (uid: string, data: Partial<User>) => {
  await supabase
    .from('profiles')
    .update(data)
    .eq('id', uid);
};

export const deleteUserAccount = async (uid: string) => {
  // In Supabase, account deletion is usually handled via Edge Functions or manual triggers
  // For this demo, we sign out and cleanup profile
  await supabase.from('profiles').delete().eq('id', uid);
  await supabase.auth.signOut();
};
