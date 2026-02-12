#!/usr/bin/env node
/**
 * Import posts from seed.json into Supabase public.post table.
 *
 * Uses batched inserts (default 1000), resolves author_id from public.user by username.
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Usage:
 *   npx tsx scripts/import_posts.ts --file ./seed.json
 *   npx tsx scripts/import_posts.ts --file ./seed.json --batchSize 500
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { chunk } from './utils/batch';
import { loadPosts } from './utils/loadPosts';
import { withRetry } from './utils/retry';
import { buildUserMap } from './utils/userMap';
import { validatePost, type RawPost, type ValidatedPost } from './utils/validate';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function parseArgs(): { file: string; batchSize: number } {
  const args = process.argv.slice(2);
  let file = './seed.json';
  let batchSize = 1000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      file = args[i + 1];
      i++;
    } else if (args[i] === '--batchSize' && args[i + 1]) {
      batchSize = parseInt(args[i + 1], 10);
      if (isNaN(batchSize) || batchSize < 1) batchSize = 1000;
      i++;
    }
  }

  return { file, batchSize };
}

function ensureFailedBatchesDir(): string {
  const dir = path.join(process.cwd(), 'failed_batches');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function writeFailedBatch(rows: ValidatedPost[]): void {
  const dir = ensureFailedBatchesDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filePath = path.join(dir, `${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf8');
  console.error(`  ⚠ Wrote failed batch to ${filePath}`);
}

async function main(): Promise<void> {
  const { file, batchSize } = parseArgs();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Set them in .env');
    process.exit(1);
  }

  const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`📂 Loading posts from ${filePath}...`);
  const posts = await loadPosts(filePath);
  console.log(`   Loaded ${posts.length} posts`);

  if (posts.length === 0) {
    console.log('No posts to import.');
    return;
  }

  const uniqueUsernames = [...new Set(posts.map((p) => p.author).filter(Boolean))];
  console.log(`   Unique authors: ${uniqueUsernames.length}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('🔍 Fetching user map...');
  const userMap = await buildUserMap(supabase, uniqueUsernames);
  console.log(`   Found ${userMap.size} users in database`);

  const skipped: string[] = [];
  const validated: ValidatedPost[] = [];

  for (const raw of posts) {
    const authorId = userMap.get(raw.author) ?? null;
    if (!authorId) {
      skipped.push(raw.author);
      continue;
    }
    const v = validatePost(raw as RawPost, authorId);
    if (v) validated.push(v);
  }

  if (skipped.length > 0) {
    const uniqueSkipped = [...new Set(skipped)];
    console.log(`⚠ Skipped ${skipped.length} posts (${uniqueSkipped.length} unknown authors): ${uniqueSkipped.slice(0, 10).join(', ')}${uniqueSkipped.length > 10 ? '...' : ''}`);
  }

  console.log(`\n📝 Inserting ${validated.length} posts in batches of ${batchSize}...`);

  let inserted = 0;
  let batchIndex = 0;

  for (const batch of chunk(validated, batchSize)) {
    batchIndex++;

    try {
      await withRetry(
        async () => {
          const { error } = await supabase.from('post').insert(batch);
          if (error) throw error;
        },
        { maxAttempts: 3, baseDelayMs: 1000 }
      );
      inserted += batch.length;
      if (inserted % 1000 === 0 || batch.length < batchSize) {
        console.log(`   ✓ ${inserted} / ${validated.length} records`);
      }
    } catch (err) {
      console.error(`  ❌ Batch ${batchIndex} failed after retries: ${err instanceof Error ? err.message : String(err)}`);
      writeFailedBatch(batch);
    }
  }

  console.log(`\n✅ Import complete. Inserted: ${inserted}, Skipped: ${skipped.length}`);
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
