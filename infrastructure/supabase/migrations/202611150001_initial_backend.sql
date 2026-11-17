begin;

create extension if not exists pgcrypto;

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  timezone text not null default 'America/Lima',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_members (
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'operator', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (site_id, user_id)
);

create table public.edge_nodes (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  status text not null default 'offline' check (status in ('online', 'degraded', 'offline')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, name)
);

create table public.cameras (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  location text not null check (char_length(location) between 1 and 160),
  source_type text not null check (source_type in ('usb', 'rtsp')),
  source_ref text not null check (char_length(source_ref) > 0),
  enabled boolean not null default true,
  status text not null default 'offline' check (status in ('online', 'degraded', 'offline')),
  active_profile text not null check (active_profile in ('security', 'quality', 'retail', 'mobility')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, name)
);

create table public.vision_rules (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  use_case text not null check (use_case in ('security', 'quality', 'retail', 'mobility')),
  rule_type text not null check (rule_type in (
    'ppe_missing', 'restricted_zone', 'dwell_time', 'quality_defect', 'missing_part',
    'occupancy', 'queue', 'congestion', 'wrong_way', 'vehicle_access'
  )),
  enabled boolean not null default true,
  version integer not null default 1 check (version >= 1),
  parameters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vision_sessions (
  id uuid primary key default gen_random_uuid(),
  camera_id uuid not null references public.cameras(id) on delete cascade,
  edge_node_id uuid not null references public.edge_nodes(id) on delete restrict,
  use_case text not null check (use_case in ('security', 'quality', 'retail', 'mobility')),
  status text not null check (status in ('starting', 'running', 'paused', 'stopping', 'stopped', 'failed')),
  model_version text not null check (char_length(model_version) > 0),
  rule_set_version text not null check (char_length(rule_set_version) > 0),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  failure_reason text check (char_length(failure_reason) <= 500)
);

create table public.vision_events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  session_id uuid not null references public.vision_sessions(id) on delete cascade,
  camera_id uuid not null references public.cameras(id) on delete cascade,
  use_case text not null check (use_case in ('security', 'quality', 'retail', 'mobility')),
  rule_id uuid not null references public.vision_rules(id) on delete restrict,
  event_type text not null check (char_length(event_type) > 0),
  title text not null check (char_length(title) between 1 and 160),
  severity text not null check (severity in ('critical', 'high', 'medium', 'low', 'info')),
  status text not null default 'new' check (status in ('new', 'in_review', 'confirmed', 'resolved', 'dismissed')),
  occurred_at timestamptz not null,
  ended_at timestamptz,
  duration_ms bigint check (duration_ms >= 0),
  confidence double precision not null check (confidence between 0 and 1),
  track_ids text[] not null default '{}',
  zone_id uuid,
  evidence_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.event_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.vision_events(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('confirmed', 'false_positive', 'dismissed', 'escalated')),
  comment text check (char_length(comment) <= 2000),
  reviewed_at timestamptz not null default now()
);

create table public.edge_telemetry (
  id bigint generated always as identity primary key,
  edge_node_id uuid not null references public.edge_nodes(id) on delete cascade,
  camera_id uuid not null references public.cameras(id) on delete cascade,
  session_id uuid references public.vision_sessions(id) on delete set null,
  timestamp timestamptz not null,
  connection_status text not null check (connection_status in ('online', 'degraded', 'offline')),
  fps double precision not null check (fps >= 0),
  latency_ms double precision not null check (latency_ms >= 0),
  inference_ms double precision not null check (inference_ms >= 0),
  dropped_frames_percent double precision not null check (dropped_frames_percent between 0 and 100),
  gpu_utilization_percent double precision check (gpu_utilization_percent between 0 and 100),
  temperature_celsius double precision,
  active_detections integer not null check (active_detections >= 0)
);

create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  report_date date not null,
  timezone text not null,
  status text not null default 'pending' check (status in ('pending', 'generating', 'ready', 'sent', 'failed')),
  event_count integer not null default 0 check (event_count >= 0),
  metrics jsonb not null default '{}'::jsonb,
  recipients text[] not null check (cardinality(recipients) > 0),
  file_path text,
  provider_message_id text,
  generated_at timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (site_id, report_date)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  site_id uuid references public.sites(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index cameras_site_idx on public.cameras(site_id);
create index sessions_camera_started_idx on public.vision_sessions(camera_id, started_at desc);
create index events_site_occurred_idx on public.vision_events(site_id, occurred_at desc);
create index events_status_severity_idx on public.vision_events(status, severity);
create index reviews_event_idx on public.event_reviews(event_id, reviewed_at desc);
create index telemetry_camera_timestamp_idx on public.edge_telemetry(camera_id, timestamp desc);
create index reports_site_date_idx on public.daily_reports(site_id, report_date desc);
create index audit_site_created_idx on public.audit_logs(site_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sites_updated_at before update on public.sites
for each row execute function public.set_updated_at();
create trigger edge_nodes_updated_at before update on public.edge_nodes
for each row execute function public.set_updated_at();
create trigger cameras_updated_at before update on public.cameras
for each row execute function public.set_updated_at();
create trigger rules_updated_at before update on public.vision_rules
for each row execute function public.set_updated_at();

create or replace function public.validate_session_relationships()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.cameras c
    join public.edge_nodes n on n.site_id = c.site_id
    where c.id = new.camera_id and n.id = new.edge_node_id
  ) then
    raise exception 'camera and edge node must belong to the same site';
  end if;
  return new;
end;
$$;

create trigger sessions_validate_relationships
before insert or update of camera_id, edge_node_id on public.vision_sessions
for each row execute function public.validate_session_relationships();

create or replace function public.validate_event_relationships()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.cameras c
    join public.vision_sessions s on s.camera_id = c.id
    join public.vision_rules r on r.site_id = c.site_id
    where c.id = new.camera_id
      and c.site_id = new.site_id
      and s.id = new.session_id
      and r.id = new.rule_id
      and s.use_case = new.use_case
      and r.use_case = new.use_case
  ) then
    raise exception 'event relationships do not belong to the same site and use case';
  end if;
  return new;
end;
$$;

create trigger events_validate_relationships
before insert or update of site_id, session_id, camera_id, rule_id, use_case
on public.vision_events
for each row execute function public.validate_event_relationships();

create or replace function public.is_site_member(p_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.site_members
    where site_id = p_site_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_site_role(p_site_id uuid, p_roles text[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.site_members
    where site_id = p_site_id and user_id = auth.uid() and role = any(p_roles)
  );
$$;

create or replace function public.create_site_with_owner(p_name text, p_timezone text default 'America/Lima')
returns public.sites
language plpgsql
security definer
set search_path = public
as $$
declare
  created_site public.sites;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  insert into public.sites(name, timezone) values (p_name, p_timezone) returning * into created_site;
  insert into public.site_members(site_id, user_id, role) values (created_site.id, auth.uid(), 'owner');
  return created_site;
end;
$$;

create or replace function public.review_vision_event(
  p_event_id uuid,
  p_decision text,
  p_comment text default null
)
returns public.event_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  target_event public.vision_events;
  created_review public.event_reviews;
  next_status text;
begin
  select * into target_event from public.vision_events where id = p_event_id for update;
  if target_event.id is null or not public.has_site_role(target_event.site_id, array['owner','admin','operator']) then
    raise exception 'event not found or access denied';
  end if;
  if p_decision not in ('confirmed', 'false_positive', 'dismissed', 'escalated') then
    raise exception 'invalid decision';
  end if;
  next_status := case
    when p_decision = 'confirmed' then 'confirmed'
    when p_decision in ('false_positive', 'dismissed') then 'dismissed'
    else 'in_review'
  end;
  insert into public.event_reviews(event_id, reviewer_id, decision, comment)
  values (p_event_id, auth.uid(), p_decision, p_comment)
  returning * into created_review;
  update public.vision_events set status = next_status where id = p_event_id;
  return created_review;
end;
$$;

create or replace function public.audit_entity_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  resolved_site uuid;
begin
  resolved_site := nullif(payload ->> 'site_id', '')::uuid;
  insert into public.audit_logs(site_id, actor_id, action, entity_type, entity_id, changes)
  values (resolved_site, auth.uid(), lower(tg_op), tg_table_name, payload ->> 'id', payload);
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger audit_cameras after insert or update or delete on public.cameras
for each row execute function public.audit_entity_change();
create trigger audit_rules after insert or update or delete on public.vision_rules
for each row execute function public.audit_entity_change();
create trigger audit_events after insert or update or delete on public.vision_events
for each row execute function public.audit_entity_change();
create trigger audit_reports after insert or update or delete on public.daily_reports
for each row execute function public.audit_entity_change();

alter table public.sites enable row level security;
alter table public.site_members enable row level security;
alter table public.edge_nodes enable row level security;
alter table public.cameras enable row level security;
alter table public.vision_rules enable row level security;
alter table public.vision_sessions enable row level security;
alter table public.vision_events enable row level security;
alter table public.event_reviews enable row level security;
alter table public.edge_telemetry enable row level security;
alter table public.daily_reports enable row level security;
alter table public.audit_logs enable row level security;

create policy sites_select on public.sites for select using (public.is_site_member(id));
create policy sites_update on public.sites for update using (public.has_site_role(id, array['owner','admin']));
create policy members_select on public.site_members for select using (public.is_site_member(site_id));
create policy members_manage on public.site_members for all using (public.has_site_role(site_id, array['owner','admin'])) with check (public.has_site_role(site_id, array['owner','admin']));
create policy edge_nodes_select on public.edge_nodes for select using (public.is_site_member(site_id));
create policy edge_nodes_manage on public.edge_nodes for all using (public.has_site_role(site_id, array['owner','admin','operator'])) with check (public.has_site_role(site_id, array['owner','admin','operator']));
create policy cameras_select on public.cameras for select using (public.is_site_member(site_id));
create policy cameras_manage on public.cameras for all using (public.has_site_role(site_id, array['owner','admin','operator'])) with check (public.has_site_role(site_id, array['owner','admin','operator']));
create policy rules_select on public.vision_rules for select using (public.is_site_member(site_id));
create policy rules_manage on public.vision_rules for all using (public.has_site_role(site_id, array['owner','admin','operator'])) with check (public.has_site_role(site_id, array['owner','admin','operator']));
create policy sessions_select on public.vision_sessions for select using (exists (select 1 from public.cameras c where c.id = camera_id and public.is_site_member(c.site_id)));
create policy sessions_manage on public.vision_sessions for all using (exists (select 1 from public.cameras c where c.id = camera_id and public.has_site_role(c.site_id, array['owner','admin','operator']))) with check (exists (select 1 from public.cameras c where c.id = camera_id and public.has_site_role(c.site_id, array['owner','admin','operator'])));
create policy events_select on public.vision_events for select using (public.is_site_member(site_id));
create policy reviews_select on public.event_reviews for select using (exists (select 1 from public.vision_events e where e.id = event_id and public.is_site_member(e.site_id)));
create policy telemetry_select on public.edge_telemetry for select using (exists (select 1 from public.cameras c where c.id = camera_id and public.is_site_member(c.site_id)));
create policy reports_select on public.daily_reports for select using (public.is_site_member(site_id));
create policy reports_insert on public.daily_reports for insert with check (public.has_site_role(site_id, array['owner','admin','operator']));
create policy audit_select on public.audit_logs for select using (public.has_site_role(site_id, array['owner','admin']));

grant execute on function public.create_site_with_owner(text, text) to authenticated;
grant execute on function public.review_vision_event(uuid, text, text) to authenticated;

alter publication supabase_realtime add table public.cameras;
alter publication supabase_realtime add table public.vision_sessions;
alter publication supabase_realtime add table public.vision_events;
alter publication supabase_realtime add table public.edge_telemetry;
alter publication supabase_realtime add table public.daily_reports;

commit;
