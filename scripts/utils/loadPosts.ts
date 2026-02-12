/**
 * Loads posts from a file. Supports:
 * - JSON array: [...]
 * - JSON object with array: { "posts": [...] }
 * - NDJSON: one JSON object per line
 */

import * as fs from 'fs';
import * as readline from 'readline';

export interface RawPost {
  title: string;
  author: string;
  description?: string;
  image?: string;
}

async function* iterNdjson(filePath: string): AsyncGenerator<RawPost> {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as RawPost;
      if (parsed && typeof parsed.author === 'string' && typeof parsed.title === 'string') {
        yield parsed;
      }
    } catch {
      // skip invalid lines
    }
  }
}

async function loadNdjson(filePath: string): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  for await (const p of iterNdjson(filePath)) {
    posts.push(p);
  }
  return posts;
}

function loadJson(filePath: string): RawPost[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);

  if (Array.isArray(parsed)) {
    return parsed.filter(
      (p): p is RawPost => p && typeof p.author === 'string' && typeof p.title === 'string'
    );
  }

  if (parsed && typeof parsed === 'object') {
    const arr = parsed.posts ?? parsed.data ?? parsed.items ?? [];
    if (Array.isArray(arr)) {
      return arr.filter(
        (p: unknown): p is RawPost =>
          p != null && typeof (p as RawPost).author === 'string' && typeof (p as RawPost).title === 'string'
      );
    }
  }

  return [];
}

/**
 * Detects format and loads posts.
 * Tries JSON first (array or { posts: [...] }); falls back to NDJSON if JSON parse fails.
 */
export async function loadPosts(filePath: string): Promise<RawPost[]> {
  const content = fs.readFileSync(filePath, 'utf8');
  const trimmed = content.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (p): p is RawPost => p && typeof p.author === 'string' && typeof p.title === 'string'
      );
    }
    if (parsed && typeof parsed === 'object') {
      const arr = parsed.posts ?? parsed.data ?? parsed.items ?? [];
      if (Array.isArray(arr)) {
        return arr.filter(
          (p: unknown): p is RawPost =>
            p != null && typeof (p as RawPost).author === 'string' && typeof (p as RawPost).title === 'string'
        );
      }
    }
    return [];
  } catch {
    return loadNdjson(filePath);
  }
}
