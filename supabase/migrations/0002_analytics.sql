-- Analytics: page views, events, api errors
-- Idempotent: safe to re-run.

-- =========================================================================
-- page_views: one row per route visit
-- =========================================================================
create table if not exists public.page_views (
  id              bigserial primary key,
  visitor_id      uuid references public.visitors(id) on delete cascade,
  session_id      uuid references public.sessions(id) on delete cascade,
  path            text        not null,             -- '/about'
  host            text,                              -- 'ketanraj.com'
  referrer        text,                              -- document.referrer
  -- UTM parameters from query string
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_term        text,
  utm_content     text,
  -- Denormalized geo + UA at view-time (cheap reads in /admin)
  country         text,
  region          text,
  city            text,
  ua_browser      text,
  ua_os           text,
  ua_device       text,
  ts              timestamptz not null default now()
);

create index if not exists pv_ts            on public.page_views(ts desc);
create index if not exists pv_path          on public.page_views(path);
create index if not exists pv_country       on public.page_views(country);
create index if not exists pv_visitor       on public.page_views(visitor_id);
create index if not exists pv_session       on public.page_views(session_id);
create index if not exists pv_utm_source    on public.page_views(utm_source);
create index if not exists pv_referrer      on public.page_views(referrer);

-- =========================================================================
-- events: custom events fired via track()
-- =========================================================================
create table if not exists public.events (
  id              bigserial primary key,
  visitor_id      uuid references public.visitors(id) on delete cascade,
  session_id      uuid references public.sessions(id) on delete cascade,
  name            text        not null,              -- 'click', 'voice', 'scroll_depth', ...
  props           jsonb,                              -- arbitrary
  path            text,                               -- pathname when event fired
  country         text,
  ts              timestamptz not null default now()
);

create index if not exists ev_ts        on public.events(ts desc);
create index if not exists ev_name      on public.events(name);
create index if not exists ev_visitor   on public.events(visitor_id);
create index if not exists ev_path      on public.events(path);

-- =========================================================================
-- api_errors: server-side error log feeding the API health card
-- =========================================================================
create table if not exists public.api_errors (
  id              bigserial primary key,
  endpoint        text        not null,              -- '/api/conversations/message'
  status          integer     not null,              -- 4xx/5xx
  message         text,
  ip_hash         text,
  ts              timestamptz not null default now()
);

create index if not exists ae_ts        on public.api_errors(ts desc);
create index if not exists ae_status    on public.api_errors(status);
create index if not exists ae_endpoint  on public.api_errors(endpoint);

-- RLS on, no policies → anon blocked; only service role reads/writes.
alter table public.page_views enable row level security;
alter table public.events     enable row level security;
alter table public.api_errors enable row level security;
