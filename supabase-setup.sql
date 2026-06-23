-- ============================================================
--  mattyeeredemptiontour Supabase setup (run ONCE)
--  Supabase dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- One flexible table holds everything: RSVPs, game answers, notes, scores.
-- Future stamps reuse it, no schema change per date.
create table if not exists public.entries (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  who         text not null default 'josie',   -- 'josie' (her) | 'matt' (you)
  stamp       text not null,                    -- which date: 'afterdark', 'hub', 'stamp5'…
  kind        text not null,                    -- 'rsvp' | 'answer' | 'note' | 'score' | …
  k           text,                             -- optional sub-key within a kind
  value       jsonb                             -- the payload (anything)
);

create index if not exists entries_lookup_idx
  on public.entries (stamp, kind, who, created_at desc);

-- The anon key SHIPS IN THE STATIC SITE, so it is public. RLS is what keeps
-- it safe: anyone can read + append, but NOBODY can edit or delete via the
-- anon key. You change/remove rows only from the dashboard (service role).
-- Worst a stranger could do is append junk you can see and delete.
alter table public.entries enable row level security;

drop policy if exists "anon read"   on public.entries;
drop policy if exists "anon append" on public.entries;
create policy "anon read"   on public.entries for select to anon using (true);
create policy "anon append" on public.entries for insert to anon with check (true);

-- Live updates (powers DB.onNew → her page reacts the instant you drop a note).
-- If you re-run this file and THIS line errors "already member", ignore it.
alter publication supabase_realtime add table public.entries;
