
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../types.ts';

const SUPABASE_URL = 'https://qpgidlybygavthytsxvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IfneTTGO7RqW4vjlMJ8HQw_xRq83L6o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Track current user for synchronous access across the application
let _currentUser: any = null;
supabase.auth.onAuthStateChange((_event, session) => {
  _currentUser = session?.user || null;
});

export const auth = {
  /**
   * Returns the currently authenticated user session synchronously.
   */
  get currentUser() {
    return _currentUser;
  },

  onAuthStateChanged: (callback: (user: any) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return () => subscription.unsubscribe();
  },

  signIn: async (email: string, password?: string) => {
    if (!password) throw new Error("Credentials required.");
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (error) throw error;
    return data;
  },

  signUp: async (email: string, password: string, role: UserRole, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role: role },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return data;
  },

  verifyOtp: async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
  }
};

export const db = {
  from: (table: string) => supabase.from(table),
  
  getCollection: (key: string) => {
    const data = localStorage.getItem(`bfi_ledger_${key}`);
    return data ? JSON.parse(data) : [];
  },

  saveToCollection: (key: string, item: any) => {
    const data = localStorage.getItem(`bfi_ledger_${key}`);
    const collection = data ? JSON.parse(data) : [];
    collection.push(item);
    localStorage.setItem(`bfi_ledger_${key}`, JSON.stringify(collection));
    window.dispatchEvent(new Event('storage'));
  }
};

export const storage = supabase.storage;
