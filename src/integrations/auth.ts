// Supabase-based auth utilities to replace the Lovable auto-generated integration.
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const auth = {
  // Browser flow: redirect to provider
  signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
    // Supabase handles the OAuth redirect flow. Keep redirect_uri if provided.
    return supabase.auth.signInWithOAuth({ provider: provider as any as string }, {
      redirectTo: opts?.redirect_uri,
      scopes: opts?.extraParams?.scope,
    } as any);
  },

  // If you need to set a session server-side after exchanging tokens, use this helper.
  setSession: async (tokens: { access_token?: string; refresh_token?: string }) => {
    try {
      await supabase.auth.setSession(tokens as any);
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  },
};
