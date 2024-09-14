import { writable } from "svelte/store";
import type { User } from '@supabase/gotrue-js';
import type { SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | undefined;
export let supabaseObject = (supa?: SupabaseClient) => {
    if (supa) supabase = supa;
    return supabase;
};

export let user = writable<User | null>(null);

export const signInWithGoogle = async () => {
    if (!supabase) return;

    if (process.env.PW_TEST_USERNAME && process.env.PW_TEST_PASSWORD) {
        await supabase.auth.signInWithPassword({
            email: process.env.PW_TEST_USERNAME,
            password: process.env.PW_TEST_PASSWORD
        });
    } else {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${process.}${window.location.pathname.substring(1)}`,
            },
        });
    }
};