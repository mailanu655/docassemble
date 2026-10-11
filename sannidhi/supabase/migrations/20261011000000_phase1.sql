-- Sannidhi, Phase 1 schema.
-- Temples post; devotees follow, pray, comment and RSVP. No payments are processed here:
-- temples link out to their own donation pages.

create extension if not exists postgis;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- enums
create type language_code as enum ('en', 'te', 'ta', 'hi', 'kn', 'gu');
create type parking_state as enum ('ok', 'filling', 'full');
create type post_type as enum ('update', 'event', 'darshan', 'urgent');
create type temple_role as enum ('owner', 'admin', 'editor');
create type claim_status as enum ('pending', 'approved', 'rejected');
create type report_status as enum ('open', 'actioned', 'dismissed');
create type temple_source as enum ('seeded', 'claimed', 'self_registered');

-- ---------------------------------------------------------------- people
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  language language_code not null default 'en',
  home_point geography(point),
  is_staff boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- temples
create table public.temples (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  name text not null,
  short_name text not null,
  about text,
  deities text[] not null default '{}',
  languages language_code[] not null default '{en}',
  phone text,
  website text,
  donation_url text,
  address text not null,
  city text not null,
  state char(2) not null,
  point geography(point) not null,
  cover_path text,
  logo_path text,
  source temple_source not null default 'seeded',
  verified boolean not null default false,
  follower_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index temples_point_idx on public.temples using gist (point);
create index temples_name_trgm_idx on public.temples using gin (name gin_trgm_ops);

-- Live "today" status that temple staff update from the dashboard.
create table public.temple_status (
  temple_id uuid primary key references public.temples on delete cascade,
  open boolean not null default true,
  closes_at time,
  aarti_at time,
  parking parking_state not null default 'ok',
  parking_note text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles
);

create table public.temple_roles (
  temple_id uuid not null references public.temples on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  role temple_role not null,
  created_at timestamptz not null default now(),
  primary key (temple_id, user_id)
);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  contact_title text not null,
  contact_email text not null,
  contact_phone text,
  -- Storage paths in the private "claims" bucket (EIN letter, board letter, utility bill).
  document_paths text[] not null default '{}',
  status claim_status not null default 'pending',
  reviewed_by uuid references public.profiles,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);
create unique index claims_one_pending_per_user on public.claims (temple_id, user_id) where status = 'pending';

-- Satellite locations (e.g. a temple's community hall across the road).
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples on delete cascade,
  name text not null,
  address text not null,
  point geography(point)
);

create table public.follows (
  user_id uuid not null references public.profiles on delete cascade,
  temple_id uuid not null references public.temples on delete cascade,
  notify_urgent boolean not null default true,
  notify_events boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, temple_id)
);
create index follows_temple_idx on public.follows (temple_id);

-- ---------------------------------------------------------------- content
create table public.events (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples on delete cascade,
  location_id uuid references public.locations on delete set null,
  title text not null,
  category text not null default 'Festival',
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  cover_path text,
  program jsonb not null default '[]',
  rsvp_enabled boolean not null default true,
  capacity integer check (capacity is null or capacity > 0),
  created_by uuid not null references public.profiles,
  created_at timestamptz not null default now()
);
create index events_temple_start_idx on public.events (temple_id, starts_at);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples on delete cascade,
  author_id uuid not null references public.profiles,
  type post_type not null default 'update',
  body text not null check (char_length(body) between 1 and 1200),
  original_language language_code not null default 'en',
  translations jsonb not null default '{}',
  image_paths text[] not null default '{}',
  event_id uuid references public.events on delete set null,
  pray_count integer not null default 0,
  comment_count integer not null default 0,
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  check (type <> 'event' or event_id is not null)
);
create index posts_temple_created_idx on public.posts (temple_id, created_at desc);

create table public.rsvps (
  event_id uuid not null references public.events on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  headcount smallint not null default 1 check (headcount between 1 and 20),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.prays (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  hidden_at timestamptz,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);

create table public.shares (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid references public.profiles on delete set null,
  channel text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- safety
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles on delete cascade,
  post_id uuid references public.posts on delete cascade,
  comment_id uuid references public.comments on delete cascade,
  reason text not null,
  status report_status not null default 'open',
  handled_by uuid references public.profiles,
  created_at timestamptz not null default now(),
  check (num_nonnulls(post_id, comment_id) = 1)
);

-- A temple can block a devotee from commenting on its posts.
create table public.blocks (
  temple_id uuid not null references public.temples on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  created_by uuid not null references public.profiles,
  created_at timestamptz not null default now(),
  primary key (temple_id, user_id)
);

-- ---------------------------------------------------------------- system
create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles on delete cascade,
  kind text not null,
  post_id uuid references public.posts on delete cascade,
  event_id uuid references public.events on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.push_tokens (
  token text primary key,
  user_id uuid not null references public.profiles on delete cascade,
  platform text not null check (platform in ('ios', 'android', 'web')),
  updated_at timestamptz not null default now()
);

-- Shared Hindu calendar used for festival reminders and composer suggestions.
create table public.festivals (
  id serial primary key,
  name text not null,
  regional_names jsonb not null default '{}',
  observed_on date not null,
  unique (name, observed_on)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles,
  temple_id uuid references public.temples on delete set null,
  action text not null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers
create or replace function public.has_temple_role(t uuid, roles temple_role[] default '{owner,admin,editor}')
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from temple_roles where temple_id = t and user_id = auth.uid() and role = any (roles)
  );
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_staff from profiles where id = auth.uid()), false);
$$;

-- Denormalised counters, kept in triggers so feeds don't count rows.
create or replace function public.bump_counter() returns trigger
language plpgsql security definer set search_path = public as $$
declare d integer := case when tg_op = 'INSERT' then 1 else -1 end;
begin
  if tg_table_name = 'prays' then
    update posts set pray_count = pray_count + d where id = coalesce(new.post_id, old.post_id);
  elsif tg_table_name = 'comments' then
    update posts set comment_count = comment_count + d where id = coalesce(new.post_id, old.post_id);
  elsif tg_table_name = 'follows' then
    update temples set follower_count = follower_count + d where id = coalesce(new.temple_id, old.temple_id);
  end if;
  return null;
end;
$$;
create trigger prays_count after insert or delete on public.prays for each row execute function public.bump_counter();
create trigger comments_count after insert or delete on public.comments for each row execute function public.bump_counter();
create trigger follows_count after insert or delete on public.follows for each row execute function public.bump_counter();

-- Approving a claim makes the claimant the owner and marks the temple verified.
create or replace function public.on_claim_approved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and old.status <> 'approved' then
    insert into temple_roles (temple_id, user_id, role) values (new.temple_id, new.user_id, 'owner')
      on conflict (temple_id, user_id) do update set role = 'owner';
    update temples set verified = true, source = 'claimed', updated_at = now() where id = new.temple_id;
    insert into audit_log (actor_id, temple_id, action, detail)
      values (new.reviewed_by, new.temple_id, 'claim.approved', jsonb_build_object('claim_id', new.id));
  end if;
  return new;
end;
$$;
create trigger claims_approved after update of status on public.claims for each row execute function public.on_claim_approved();

-- Feed for the signed-in devotee: posts from followed temples, newest first.
create or replace view public.home_feed with (security_invoker = true) as
  select p.* from public.posts p
  join public.follows f on f.temple_id = p.temple_id and f.user_id = auth.uid()
  where p.hidden_at is null
  order by p.created_at desc;

-- ---------------------------------------------------------------- row level security
alter table public.profiles enable row level security;
alter table public.temples enable row level security;
alter table public.temple_status enable row level security;
alter table public.temple_roles enable row level security;
alter table public.claims enable row level security;
alter table public.locations enable row level security;
alter table public.follows enable row level security;
alter table public.events enable row level security;
alter table public.posts enable row level security;
alter table public.rsvps enable row level security;
alter table public.prays enable row level security;
alter table public.comments enable row level security;
alter table public.shares enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;
alter table public.festivals enable row level security;
alter table public.audit_log enable row level security;

-- Profiles: you see and edit your own; display names are visible on comments via a view later.
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid() and is_staff = false);

-- Public directory data.
create policy "temples are public" on public.temples for select using (true);
create policy "temple admins edit" on public.temples for update using (has_temple_role(id, '{owner,admin}')) with check (has_temple_role(id, '{owner,admin}'));
create policy "status is public" on public.temple_status for select using (true);
create policy "temple staff set status" on public.temple_status for all using (has_temple_role(temple_id)) with check (has_temple_role(temple_id));
create policy "locations are public" on public.locations for select using (true);
create policy "temple admins edit locations" on public.locations for all using (has_temple_role(temple_id, '{owner,admin}')) with check (has_temple_role(temple_id, '{owner,admin}'));
create policy "festivals are public" on public.festivals for select using (true);

-- Roles: members of a temple see its team; owners manage it.
create policy "team sees team" on public.temple_roles for select using (user_id = auth.uid() or has_temple_role(temple_id));
create policy "owners manage team" on public.temple_roles for all using (has_temple_role(temple_id, '{owner}')) with check (has_temple_role(temple_id, '{owner}'));

-- Claims: claimant files and reads their own; staff review.
create policy "file a claim" on public.claims for insert with check (user_id = auth.uid() and status = 'pending');
create policy "read own claim" on public.claims for select using (user_id = auth.uid() or is_staff());
create policy "staff review claims" on public.claims for update using (is_staff()) with check (is_staff());

-- Follows, prays, RSVPs, shares: a devotee manages their own rows.
create policy "own follows" on public.follows for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own prays" on public.prays for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rsvps" on public.rsvps for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "temple sees rsvps" on public.rsvps for select using (
  has_temple_role((select temple_id from public.events e where e.id = event_id))
);
create policy "log a share" on public.shares for insert with check (user_id is null or user_id = auth.uid());

-- Events and posts: public to read, only temple staff write. Devotees never post.
create policy "events are public" on public.events for select using (true);
create policy "temple staff write events" on public.events for all using (has_temple_role(temple_id)) with check (has_temple_role(temple_id) and created_by = auth.uid());
create policy "visible posts are public" on public.posts for select using (hidden_at is null or has_temple_role(temple_id) or is_staff());
create policy "temple staff write posts" on public.posts for insert with check (has_temple_role(temple_id) and author_id = auth.uid());
create policy "temple staff edit posts" on public.posts for update using (has_temple_role(temple_id)) with check (has_temple_role(temple_id));
create policy "temple admins delete posts" on public.posts for delete using (has_temple_role(temple_id, '{owner,admin}'));

-- Comments: anyone signed in can reply unless the temple blocked them.
create policy "visible comments are public" on public.comments for select using (
  hidden_at is null or user_id = auth.uid()
  or has_temple_role((select temple_id from public.posts p where p.id = post_id))
);
create policy "reply to a post" on public.comments for insert with check (
  user_id = auth.uid()
  and not exists (
    select 1 from public.blocks b join public.posts p on p.temple_id = b.temple_id
    where p.id = post_id and b.user_id = auth.uid()
  )
);
create policy "delete own comment" on public.comments for delete using (user_id = auth.uid());
create policy "temple hides comments" on public.comments for update using (
  has_temple_role((select temple_id from public.posts p where p.id = post_id))
) with check (
  has_temple_role((select temple_id from public.posts p where p.id = post_id))
);

-- Reports and blocks.
create policy "file a report" on public.reports for insert with check (reporter_id = auth.uid());
create policy "staff handle reports" on public.reports for all using (is_staff()) with check (is_staff());
create policy "temple manages blocks" on public.blocks for all using (has_temple_role(temple_id, '{owner,admin}')) with check (has_temple_role(temple_id, '{owner,admin}') and created_by = auth.uid());

-- Notifications and push tokens: private to the user.
create policy "own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "mark read" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own push tokens" on public.push_tokens for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Audit log: temple owners read their own history; staff read all. Writes happen in security definer functions.
create policy "read audit" on public.audit_log for select using (is_staff() or (temple_id is not null and has_temple_role(temple_id, '{owner}')));
