import { createSupabaseBrowserClient } from "./supabase";

export async function getAdminSession() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function signInAdmin(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOutAdmin() {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}