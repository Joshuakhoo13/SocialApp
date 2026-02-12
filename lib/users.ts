import { supabase } from '@/lib/supabase';

export async function createUserProfile(
  userId: string,
  username: string
): Promise<{ error: Error | null; code?: string }> {
  const trimmed = username.trim();
  const { error } = await supabase.from('user').insert({
    id: userId,
    username: trimmed,
    created_at: new Date().toISOString(),
  });
  if (error) {
    const isDuplicate = error.code === '23505';
    return {
      error: new Error(isDuplicate ? 'Username is already taken' : error.message),
      code: isDuplicate ? 'USERNAME_TAKEN' : undefined,
    };
  }
  return { error: null };
}

export async function getUserProfile(userId: string): Promise<{ username: string | null; error: Error | null }> {
  const { data, error } = await supabase.from('user').select('username').eq('id', userId).single();
  if (error) {
    if (error.code === 'PGRST116') return { username: null, error: null };
    return { username: null, error: new Error(error.message) };
  }
  return { username: data?.username ?? null, error: null };
}
