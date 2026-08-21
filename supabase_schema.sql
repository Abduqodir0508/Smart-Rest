-- ========================================================
-- SMART RESTO POS - SUPABASE REALTIME VA DATABASE STRUKTURASI
-- ========================================================

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

-- 3. Buyurtmalar jadvali
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
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

-- 4. Realtime Broadcast ruxsatlarini yoqish
ALTER PUBLICATION supabase_realtime ADD TABLE orders, tables, menu;
