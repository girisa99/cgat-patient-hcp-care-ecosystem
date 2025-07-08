-- Initial schema setup for dev/test/uat environments
create schema if not exists public_dev;
create schema if not exists public_test;
create schema if not exists public_uat;

-- Optionally set default search_path depending on environment using RLS or session variables.