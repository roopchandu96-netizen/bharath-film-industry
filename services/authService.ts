// services/authService.ts
import { supabase } from "./firebase";
import { syncUserToFirestore } from "./userService";
import { User, UserRole } from "../types";

/**
 * Sign in a user using email & password, then synchronise their profile.
 * Returns the unified {@link User} object on success.
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  // Supabase authentication – handles hashing internally.
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  const supabaseUser = data.user;
  if (!supabaseUser) {
    throw new Error("Authentication succeeded but no user data returned.");
  }

  // Ensure the user profile exists / is up‑to‑date in the "profiles" table.
  const syncedUser = await syncUserToFirestore(supabaseUser);
  return syncedUser;
};

/**
 * Register a new user with email, password, role, and name.
 * Creates the Supabase auth account and syncs the profile to the "profiles" table.
 */
export const signUp = async (
  email: string,
  password: string,
  role: UserRole,
  name: string
): Promise<void> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, role: role },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }

  // If Supabase returns a user immediately (email confirmation disabled),
  // sync their profile right away.
  if (data.user) {
    await syncUserToFirestore(data.user, role, name);
  }
};
