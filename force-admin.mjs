import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpgidlybygavthytsxvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IfneTTGO7RqW4vjlMJ8HQw_xRq83L6o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    const email = 'bharathfilmindustry@gmail.com';

    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: 'password' // We just need auth token to do user things
    });

    if (authError) {
        console.log("LOGIN ERROR: ", authError.message);
        return;
    }

    console.log("LOGGED IN AS:", session.user.id);

    // Try to force update
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'ADMIN' })
        .eq('id', session.user.id)
        .select();

    if (error) {
        console.error("FAILED TO FORCE ADMIN ROLE:", error.message);
    } else {
        console.log("SUCCESS! ADMIN ROLE GRANTED TO:", data);
    }
}

run();
