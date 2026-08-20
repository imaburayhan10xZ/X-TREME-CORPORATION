-- Run this script in the SQL Editor of your MASTER SUPABASE PROJECT.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: tenants_registry
-- Purpose: Stores the configuration and routing details for all sub-businesses
CREATE TABLE IF NOT EXISTS tenants_registry (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  email text NOT NULL UNIQUE,
  tenant_url text NOT NULL,
  tenant_key text NOT NULL,
  status text DEFAULT 'active',
  plan text DEFAULT 'pro',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Table: super_admins
-- Purpose: Determines who can access the /root-login and /root-dashboard pages
CREATE TABLE IF NOT EXISTS super_admins (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Security: Disable RLS for now on Master DB or add policies allowing super_admins full access
ALTER TABLE tenants_registry DISABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;

-- IMPORTANT INSTRUCTIONS:
-- 1. Create a user via Supabase Auth (e.g. root@system.com)
-- 2. Insert that user's email into the 'super_admins' table:
--    INSERT INTO super_admins (email) VALUES ('root@system.com');
