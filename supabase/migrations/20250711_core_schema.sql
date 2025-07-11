-- 2025-07-11  Core schema for local dev
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists roles (
  id bigserial primary key,
  name text unique not null
);

create table if not exists user_roles (
  user_id uuid   references profiles(id) on delete cascade,
  role_id bigint references roles(id)    on delete cascade,
  primary key (user_id, role_id)
);

create table if not exists active_issues (
  id bigserial primary key,
  severity text not null default 'medium',
  description text not null,
  created_at timestamptz default now()
);

create table if not exists issue_fixes (
  id bigserial primary key,
  issue_id bigint references active_issues(id) on delete cascade,
  fixer_id uuid references profiles(id),
  description text not null,
  created_at timestamptz default now()
);