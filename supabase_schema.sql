-- Supabase CRM Schema for X-TREME CORPORATION

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tables

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('developer', 'admin')) DEFAULT 'admin',
  full_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price decimal(10, 2) NOT NULL,
  duration_days int, -- Made nullable for permanent packages
  package_type text DEFAULT 'regular', -- 'free_trial', 'regular', 'permanent'
  offer_price decimal(10, 2),
  obb_fee_amount decimal(10, 2) DEFAULT 0,
  obb_fee_duration_days int,
  description text,
  color_label text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Note: If you already created the packages table, run these ALTER statements in your Supabase SQL Editor:
-- ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_type text DEFAULT 'regular';
-- ALTER TABLE packages ADD COLUMN IF NOT EXISTS offer_price decimal(10, 2);
-- ALTER TABLE packages ADD COLUMN IF NOT EXISTS obb_fee_amount decimal(10, 2) DEFAULT 0;
-- ALTER TABLE packages ADD COLUMN IF NOT EXISTS obb_fee_duration_days int;
-- ALTER TABLE packages ALTER COLUMN duration_days DROP NOT NULL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS next_obb_fee_date timestamp with time zone;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sid text UNIQUE NOT NULL,
  full_name text NOT NULL,
  mobile text NOT NULL,
  email text,
  license_key text UNIQUE NOT NULL,
  package_id uuid REFERENCES packages(id),
  subscription_start timestamp with time zone,
  subscription_expiry timestamp with time zone,
  total_paid decimal(10, 2) DEFAULT 0,
  total_due decimal(10, 2) DEFAULT 0,
  next_obb_fee_date timestamp with time zone,
  status text DEFAULT 'active',
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  payment_method text NOT NULL,
  transaction_id text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS renewals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  package_id uuid REFERENCES packages(id),
  amount decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS obb_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES admins(id),
  action text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value text NOT NULL
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_users_sid ON users(sid);
CREATE INDEX IF NOT EXISTS idx_users_license_key ON users(license_key);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_renewals_user_id ON renewals(user_id);
CREATE INDEX IF NOT EXISTS idx_obb_payments_user_id ON obb_payments(user_id);

-- 3. RLS Policies
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE obb_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: The error "new row violates row-level security policy" happens on INSERT 
-- when a policy doesn't have a `WITH CHECK` clause.
-- These updated policies include both `USING` (for SELECT/DELETE) and `WITH CHECK` (for INSERT/UPDATE).
-- Run this in your Supabase SQL editor to fix the issue.

DROP POLICY IF EXISTS "Enable all for all" ON admins;
CREATE POLICY "Enable all for all" ON admins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for all" ON packages;
CREATE POLICY "Enable all for all" ON packages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for all" ON users;
CREATE POLICY "Enable all for all" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for all" ON payments;
CREATE POLICY "Enable all for all" ON payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for all" ON renewals;
CREATE POLICY "Enable all for all" ON renewals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for all" ON obb_payments;
CREATE POLICY "Enable all for all" ON obb_payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for all" ON activity_logs;
CREATE POLICY "Enable all for all" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for all" ON settings;
CREATE POLICY "Enable all for all" ON settings FOR ALL USING (true) WITH CHECK (true);
