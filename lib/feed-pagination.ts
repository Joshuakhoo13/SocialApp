import { supabase } from '@/lib/supabase';

export const PAGE_SIZE = 15;

export type FeedCursor = {
  created_at: string;
  id: string;
};

export type FeedPostRow = {
  id: string;
  title: string;
  author_id: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  user?: { username?: string } | null;
};

const SELECT_COLS = 'id, title, author_id, description, image_url, created_at, user(username)';

/**
 * Fetches the first page of posts for the feed.
 * Order: created_at DESC, id DESC.
 */
export async function fetchFirstPage(): Promise<{
  data: FeedPostRow[];
  cursor: FeedCursor | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from('post')
    .select(SELECT_COLS)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    return { data: [], cursor: null, error: new Error(error.message) };
  }

  const rows = (data ?? []) as FeedPostRow[];
  const cursor =
    rows.length > 0
      ? { created_at: rows[rows.length - 1].created_at, id: rows[rows.length - 1].id }
      : null;

  return { data: rows, cursor, error: null };
}

/**
 * Fetches the next page of posts using keyset pagination.
 * Keyset: (created_at < cursor.created_at) OR (created_at = cursor.created_at AND id < cursor.id)
 */
export async function fetchNextPage(cursor: FeedCursor): Promise<{
  data: FeedPostRow[];
  nextCursor: FeedCursor | null;
  error: Error | null;
}> {
  // Quote timestamps to avoid misparsing (e.g. ".000" in ISO string)
  const ts = `"${cursor.created_at}"`;
  const filter = `or(created_at.lt.${ts},and(created_at.eq.${ts},id.lt.${cursor.id}))`;

  const { data, error } = await supabase
    .from('post')
    .select(SELECT_COLS)
    .or(filter)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    return { data: [], nextCursor: null, error: new Error(error.message) };
  }

  const rows = (data ?? []) as FeedPostRow[];
  const nextCursor =
    rows.length > 0
      ? { created_at: rows[rows.length - 1].created_at, id: rows[rows.length - 1].id }
      : null;

  return { data: rows, nextCursor, error: null };
}
