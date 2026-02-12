/**
 * Fetches all users matching the given usernames in a single query.
 * Returns a Map: username -> user_id
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function buildUserMap(
  supabase: SupabaseClient,
  usernames: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(usernames)].filter(Boolean);
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase
    .from('user')
    .select('id, username')
    .in('username', unique);

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.username != null && row.id != null) {
      map.set(String(row.username), String(row.id));
    }
  }
  return map;
}
