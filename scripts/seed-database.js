#!/usr/bin/env node
require('dotenv').config();

/**
 * Seed script: creates auth users and populates user table from authors in seed.json.
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard > Project Settings > API)
 * Run: npm run seed
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = 'password123';
const EMAIL_DOMAIN = '@xmail.com';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Set them in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function toEmail(author) {
  const local = String(author).replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase() || 'user';
  return `${local}${EMAIL_DOMAIN}`;
}

async function getOrCreateUser(author, authorToId) {
  if (authorToId.has(author)) return authorToId.get(author);

  const { data: existing } = await supabase
    .from('user')
    .select('id')
    .eq('username', author)
    .single();
  if (existing) {
    authorToId.set(author, existing.id);
    return existing.id;
  }

  const email = toEmail(author);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`Create user ${author}: ${error.message}`);

  const userId = data.user.id;
  const { error: profileError } = await supabase.from('user').insert({
    id: userId,
    username: author,
  });
  if (profileError) throw new Error(`Create profile ${author}: ${profileError.message}`);

  authorToId.set(author, userId);
  return userId;
}

async function main() {
  const seedPath = path.join(__dirname, '..', 'seed.json');
  if (!fs.existsSync(seedPath)) {
    console.error('❌ seed.json not found');
    process.exit(1);
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const posts = seed.posts || [];
  const authors = [...new Set(posts.map((p) => p.author).filter(Boolean))];
  console.log(`📂 Loaded ${authors.length} unique authors from seed.json`);

  const authorToId = new Map();
  let userCount = 0;

  for (const author of authors) {
    try {
      await getOrCreateUser(author, authorToId);
      userCount++;
      console.log(`  ✓ ${author} (${userCount} users)`);
    } catch (err) {
      console.error(`  ❌ ${author}: ${err.message}`);
    }
  }

  console.log('\n✅ Seed complete');
  console.log(`   Users: ${userCount}`);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
