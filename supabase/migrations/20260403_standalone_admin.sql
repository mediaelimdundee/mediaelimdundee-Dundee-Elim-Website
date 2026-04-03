create extension if not exists pgcrypto;

create table if not exists public.site_content_versions (
  id uuid primary key default gen_random_uuid(),
  status text not null unique check (status in ('draft', 'published')),
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  published_at timestamptz
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  subject text not null default '',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.prayer_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default '',
  request text not null,
  is_private boolean not null default false,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_site_content_versions_updated_at on public.site_content_versions;
create trigger set_site_content_versions_updated_at
before update on public.site_content_versions
for each row
execute function public.set_updated_at();

alter table public.site_content_versions enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.prayer_submissions enable row level security;

drop policy if exists "public read published site content" on public.site_content_versions;
create policy "public read published site content"
on public.site_content_versions
for select
to anon, authenticated
using (status = 'published' or auth.role() = 'authenticated');

drop policy if exists "authenticated manage site content" on public.site_content_versions;
create policy "authenticated manage site content"
on public.site_content_versions
for all
to authenticated
using (true)
with check (true);

drop policy if exists "anon submit contact forms" on public.contact_submissions;
create policy "anon submit contact forms"
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated read and update contact submissions" on public.contact_submissions;
create policy "authenticated read and update contact submissions"
on public.contact_submissions
for all
to authenticated
using (true)
with check (true);

drop policy if exists "anon submit prayer forms" on public.prayer_submissions;
create policy "anon submit prayer forms"
on public.prayer_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated read and update prayer submissions" on public.prayer_submissions;
create policy "authenticated read and update prayer submissions"
on public.prayer_submissions
for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read site media" on storage.objects;
create policy "public read site media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'site-media');

drop policy if exists "authenticated upload site media" on storage.objects;
create policy "authenticated upload site media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-media');

drop policy if exists "authenticated update site media" on storage.objects;
create policy "authenticated update site media"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-media')
with check (bucket_id = 'site-media');

drop policy if exists "authenticated delete site media" on storage.objects;
create policy "authenticated delete site media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-media');
