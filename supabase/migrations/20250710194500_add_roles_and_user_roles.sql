create extension if not exists "uuid-ossp";

-- 1. roles table
create table if not exists public.roles (
  id   uuid primary key default uuid_generate_v4(),
  name text unique not null
);

-- 2. user_roles join table
create table if not exists public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role_id uuid references public.roles(id)    on delete cascade,
  primary key (user_id, role_id)
);

-- 3. seed roles (optional but handy)
insert into public.roles (name)
values ('superAdmin'),
       ('onboardingTeam'),
       ('patientCaregiver')
on conflict (name) do nothing;