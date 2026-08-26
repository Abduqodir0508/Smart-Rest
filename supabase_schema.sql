-- ========================================================
-- SMART RESTO POS - SUPABASE REALTIME VA DATABASE STRUKTURASI
-- ========================================================

-- Enable UUID extension if not enabled (useful for auth)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Stollar jadvali
CREATE TABLE IF NOT EXISTS tables (
  id BIGSERIAL PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  zone VARCHAR(50) DEFAULT 'Asosiy Zal',
  capacity INT DEFAULT 4,
  status VARCHAR(20) DEFAULT 'empty',
  active_order_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Menyu jadvali
CREATE TABLE IF NOT EXISTS menu (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  cost_price NUMERIC(12, 2) NOT NULL,
  prep_time INT DEFAULT 15,
  available BOOLEAN DEFAULT TRUE,
  image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE menu ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Foods jadvali (alternativa sifatida ishlatilmoqda)
CREATE TABLE IF NOT EXISTS foods (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  cost_price NUMERIC(12, 2) NOT NULL,
  prep_time INT DEFAULT 15,
  available BOOLEAN DEFAULT TRUE,
  image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE foods ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Products jadvali (tovarlar sahifasi uchun)
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Waiters jadvali
CREATE TABLE IF NOT EXISTS waiters (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  pin_code VARCHAR(4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE waiters ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Buyurtmalar jadvali
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL,
  table_id BIGINT REFERENCES tables(id) ON DELETE SET NULL,
  table_number VARCHAR(50),
  waiter_name VARCHAR(100),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12, 2) DEFAULT 0,
  service_charge_rate INT DEFAULT 10,
  service_charge_amount NUMERIC(12, 2) DEFAULT 0,
  discount_rate INT DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  total_cost NUMERIC(12, 2) DEFAULT 0,
  net_profit NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waiter_id BIGINT REFERENCES waiters(id) ON DELETE SET NULL;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) SOZLAMALARI
-- ========================================================

-- RLS-ni yoqish
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Eski qoidalarni o'chirish (Xatolikni oldini olish uchun)
DROP POLICY IF EXISTS "Tables policy" ON tables;
DROP POLICY IF EXISTS "Menu policy" ON menu;
DROP POLICY IF EXISTS "Foods policy" ON foods;
DROP POLICY IF EXISTS "Products policy" ON products;
DROP POLICY IF EXISTS "Waiters policy" ON waiters;
DROP POLICY IF EXISTS "Orders policy" ON orders;

-- Barcha jadvallar uchun restaurant_id orqali siyosatlar (Policies)
-- Tables
CREATE POLICY "Tables policy" ON tables
FOR ALL USING (auth.uid() = restaurant_id) WITH CHECK (auth.uid() = restaurant_id);

-- Menu
CREATE POLICY "Menu policy" ON menu
FOR ALL USING (auth.uid() = restaurant_id) WITH CHECK (auth.uid() = restaurant_id);

-- Foods
CREATE POLICY "Foods policy" ON foods
FOR ALL USING (auth.uid() = restaurant_id) WITH CHECK (auth.uid() = restaurant_id);

-- Products
CREATE POLICY "Products policy" ON products
FOR ALL USING (auth.uid() = restaurant_id) WITH CHECK (auth.uid() = restaurant_id);

-- Waiters
CREATE POLICY "Waiters policy" ON waiters
FOR ALL USING (auth.uid() = restaurant_id) WITH CHECK (auth.uid() = restaurant_id);

-- Orders
CREATE POLICY "Orders policy" ON orders
FOR ALL USING (auth.uid() = restaurant_id) WITH CHECK (auth.uid() = restaurant_id);

-- 4. Realtime Broadcast ruxsatlarini yoqish
-- Jadvallarni alohida-alohida qo'shib chiqamiz, shunda allaqachon qo'shilganlari xato bermaydi
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE orders; EXCEPTION WHEN OTHERS THEN END; $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE tables; EXCEPTION WHEN OTHERS THEN END; $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE menu; EXCEPTION WHEN OTHERS THEN END; $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE foods; EXCEPTION WHEN OTHERS THEN END; $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE products; EXCEPTION WHEN OTHERS THEN END; $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE waiters; EXCEPTION WHEN OTHERS THEN END; $$;
