-- ketanraj.com conversation log + visitor identity
-- Apply via: Supabase Dashboard -> SQL Editor -> paste this whole file -> Run
-- Idempotent: safe to re-run; uses IF NOT EXISTS everywhere.

-- =========================================================================
-- visitors: one row per browser identity (the client-generated UUID)
-- =========================================================================
create table if not exists public.visitors (
  id              uuid primary key,
  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  ip              text,
  ip_hash         text,
  ua              text,
  ua_browser      text,
  ua_os           text,
  ua_device       text,
  language        text,
  country         text,
  region          text,
  city            text,
  timezone        text,
  latitude        text,
  longitude       text,
  screen_w        integer,
  screen_h        integer,
  dpr             real,
  referrer        text,
  visit_count     integer not null default 1
);

-- =========================================================================
-- sessions: one row per browser tab session (sessionStorage-backed UUID)
-- =========================================================================
create table if not exists public.sessions (
  id            uuid primary key,
  visitor_id    uuid not null references public.visitors(id) on delete cascade,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  channel       text,                -- 'text' | 'voice' | 'both'
  page_path     text
);

-- =========================================================================
-- messages: one row per chat/voice exchange
-- =========================================================================
create table if not exists public.messages (
  id            bigserial primary key,
  session_id    uuid not null references public.sessions(id) on delete cascade,
  visitor_id    uuid not null references public.visitors(id) on delete cascade,
  role          text not null check (role in ('user','agent')),
  source        text not null check (source in ('text','voice')),
  text          text not null,
  ts            timestamptz not null default now(),
  -- denormalized for read speed in /admin (avoid 3-way joins on list queries)
  country       text,
  city          text
);

-- Hot-path indexes ---------------------------------------------------------
create index if not exists messages_session_ts on public.messages(session_id, ts);
create index if not exists messages_ts          on public.messages(ts desc);
create index if not exists sessions_visitor     on public.sessions(visitor_id);
create index if not exists sessions_started     on public.sessions(started_at desc);
create index if not exists visitors_country     on public.visitors(country);
create index if not exists visitors_last_seen   on public.visitors(last_seen_at desc);

-- Row-Level Security: everything off for anon ------------------------------
-- The service role bypasses RLS by design. anon is never used by our
-- server (only the service key is), and we don't expose any direct
-- supabase reads to the client. RLS on with no policies = anon blocked.
alter table public.visitors  enable row level security;
alter table public.sessions  enable row level security;
alter table public.messages  enable row level security;
