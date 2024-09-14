<script context="module" lang="ts">
    import { createClient } from "@supabase/supabase-js";

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    export const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
        });
    };
    export const signOut = async () => {
        await supabase.auth.signOut();
    };
</script>

<script lang="ts">
    import { onMount, setContext } from "svelte";
    import type { AuthSession } from "@supabase/supabase-js";
    import { writable } from "svelte/store";

    let session = writable<AuthSession | null>(null);

    onMount(() => {
        supabase.auth.getSession().then(({ data }) => {
            $session = data.session;
        });

        supabase.auth.onAuthStateChange((_event, _session) => {
            $session = _session;
        });
    });

    setContext("supabase", { supabase, session });
</script>

<slot />
