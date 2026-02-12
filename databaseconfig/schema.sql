-- Enable extension for UUID generation (usually already enabled)
create extension if not exists "pgcrypto";

-- Create user table
create table public.user (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz default now()
);

-- Create post table
create table public.post (
  id uuid primary key default gen_random_uuid(),
  title varchar(25) not null check (char_length(title) <= 25),
  author_id uuid not null references public.user(id) on delete cascade,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.post enable row level security;

create policy "Authenticated users can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-photos'
);

CREATE POLICY "Anyone can view post images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'post-photos');

-- Allow users to insert their own row (when id = auth.uid())
create policy "Users can insert own profile"
  on public."user" for insert
  with check (auth.uid() = id);

-- Allow users to read their own row
create policy "Users can read own profile"
  on public."user" for select
  using (auth.uid() = id);

-- Allow anyone to view profiles
CREATE POLICY "Allow public read usernames" ON public."user"
  FOR SELECT USING (true);

-- Allow authenticated users to read all posts
CREATE POLICY "Anyone can read posts"
ON public.post
FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own posts
CREATE POLICY "Users can insert own posts"
ON public.post
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
ON public.post
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.post
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

create index if not exists post_feed_idx
on public.post (created_at desc, id desc);
