create table if not exists public.sermon_extraction_jobs (
  id uuid primary key default gen_random_uuid(),
  episode_id text not null unique,
  youtube_url text not null default '',
  video_id text not null default '',
  start_time text not null default '',
  end_time text not null default '',
  status text not null default 'queued' check (status in ('queued', 'waiting_for_archive', 'processing', 'uploading', 'ready', 'failed')),
  requested_by text not null default '',
  github_run_id text not null default '',
  audio_url text not null default '',
  error_message text not null default '',
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists sermon_extraction_jobs_status_idx
on public.sermon_extraction_jobs (status);

create index if not exists sermon_extraction_jobs_updated_at_idx
on public.sermon_extraction_jobs (updated_at desc);

drop trigger if exists set_sermon_extraction_jobs_updated_at on public.sermon_extraction_jobs;
create trigger set_sermon_extraction_jobs_updated_at
before update on public.sermon_extraction_jobs
for each row
execute function public.set_updated_at();

alter table public.sermon_extraction_jobs enable row level security;

drop policy if exists "authenticated read sermon extraction jobs" on public.sermon_extraction_jobs;
create policy "authenticated read sermon extraction jobs"
on public.sermon_extraction_jobs
for select
to authenticated
using (true);

drop policy if exists "authenticated insert sermon extraction jobs" on public.sermon_extraction_jobs;
create policy "authenticated insert sermon extraction jobs"
on public.sermon_extraction_jobs
for insert
to authenticated
with check (true);

drop policy if exists "authenticated update sermon extraction jobs" on public.sermon_extraction_jobs;
create policy "authenticated update sermon extraction jobs"
on public.sermon_extraction_jobs
for update
to authenticated
using (true)
with check (true);
